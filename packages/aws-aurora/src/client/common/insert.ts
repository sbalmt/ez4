import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { Database, Relations, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { isAnyObject } from '@ez4/utils';

import { isSkippableData, prepareFieldData } from './data.js';

type PrepareQueryResult = [string, SqlParameter[]];

export const prepareInsertQuery = <T extends Database.Schema, R extends Relations>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.InsertOneInput<T, R>
) => {
  return prepareAllQueries(table, query.data, schema, relations, null, 0);
};

const prepareAllQueries = (
  table: string,
  data: AnyObject,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  fromTable: string | null,
  variablesIndex: number,
  extraFields: string[] = [],
  extraParameters: string[] = []
): PrepareQueryResult => {
  const [preStatements, preVariables] = preparePreRelationQueries(data, relations, variablesIndex);

  const [insertFields, insertParameters, insertVariables] = prepareQueryFields(
    data,
    schema,
    relations,
    variablesIndex + preVariables.length
  );

  const [relationFields, postStatements, postVariables] = preparePostRelationQueries(
    data,
    relations,
    variablesIndex + preVariables.length + insertVariables.length,
    preStatements.length + 1
  );

  const insertStatement = [
    `INSERT INTO "${table}" (${[...insertFields, ...extraFields].join(', ')})`
  ];

  if (extraParameters) {
    insertParameters.push(...extraParameters);
  }

  if (preStatements.length || postStatements.length) {
    const allVariables = [...preVariables, ...insertVariables, ...postVariables];
    const allStatements = [...preStatements];

    if (!preStatements.length) {
      insertStatement.push(`VALUES (${insertParameters.join(', ')})`);
    } else {
      insertStatement.push(`SELECT ${insertParameters.join(', ')} FROM R${preStatements.length}`);
    }

    if (relationFields.length) {
      insertStatement.push(`RETURNING ${relationFields.join(', ')}`);
    }

    allStatements.push(insertStatement.join(' '), ...postStatements);

    const lastStatement = allStatements.pop();

    const withStatements = allStatements
      .map((statement, index) => `R${index + 1} AS (${statement})`)
      .join(', ');

    const finalStatement = `WITH ${withStatements} ${lastStatement}`;

    return [finalStatement, allVariables];
  }

  if (fromTable) {
    insertStatement.push(`SELECT ${insertParameters.join(', ')} FROM ${fromTable}`);
  } else {
    insertStatement.push(`VALUES (${insertParameters.join(', ')})`);
  }

  return [insertStatement.join(' '), insertVariables];
};

const preparePreRelationQueries = (
  data: AnyObject,
  relations: RepositoryRelationsWithSchema,
  variablesIndex: number
): [string[], SqlParameter[]] => {
  const preStatements = [];
  const preVariables = [];

  let aliasesIndex = 0;

  for (const alias in relations) {
    const relationData = data[alias];

    if (!relations[alias] || !isAnyObject(relationData) || Array.isArray(relationData)) {
      continue;
    }

    const { sourceTable, sourceColumn, sourceSchema, targetColumn } = relations[alias];

    if (relationData[targetColumn]) {
      continue;
    }

    const nextIndex = variablesIndex + preVariables.length;

    const [statement, variables] = prepareAllQueries(
      sourceTable,
      relationData,
      sourceSchema,
      {},
      null,
      nextIndex
    );

    const relationFields = [`"${sourceColumn}" AS "${alias}"`];

    if (aliasesIndex > 0) {
      relationFields.push(`R${aliasesIndex}.*`);
    }

    preStatements.push(`${statement} RETURNING ${relationFields.join(', ')}`);
    preVariables.push(...variables);

    aliasesIndex++;
  }

  return [preStatements, preVariables];
};

const preparePostRelationQueries = (
  data: AnyObject,
  relations: RepositoryRelationsWithSchema,
  variablesIndex: number,
  aliasesIndex: number
): [string[], string[], SqlParameter[]] => {
  const relationFields = new Set<string>();

  const postStatements = [];
  const postVariables = [];

  const fromTable = `R${aliasesIndex}`;

  for (const alias in relations) {
    const relationDataList = data[alias];

    if (!relations[alias] || !Array.isArray(relationDataList)) {
      continue;
    }

    const { sourceColumn, sourceTable, sourceSchema, targetColumn } = relations[alias];

    relationFields.add(`"${targetColumn}"`);

    for (const relationData of relationDataList) {
      const nextIndex = variablesIndex + postVariables.length;

      const [statement, variables] = prepareAllQueries(
        sourceTable,
        relationData,
        sourceSchema,
        {},
        fromTable,
        nextIndex,
        [`"${sourceColumn}"`],
        [`"${targetColumn}"`]
      );

      postStatements.push(statement);
      postVariables.push(...variables);
    }
  }

  return [[...relationFields], postStatements, postVariables];
};

const prepareQueryFields = <T extends Database.Schema>(
  data: T,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  variablesIndex: number
): [string[], string[], SqlParameter[]] => {
  const variables: SqlParameter[] = [];

  const properties: string[] = [];
  const references: string[] = [];

  for (const fieldKey in data) {
    const fieldValue = data[fieldKey];
    const fieldRelation = relations[fieldKey];

    if (isSkippableData(fieldValue)) {
      continue;
    }

    if (fieldRelation) {
      const { targetColumn, foreign } = fieldRelation;

      if (!foreign) {
        continue;
      }

      const targetRelationId = (fieldValue as AnyObject)[targetColumn];

      properties.push(`"${targetColumn}"`);

      if (!targetRelationId) {
        references.push(`"${fieldKey}"`);

        continue;
      }

      const [fieldName, fieldData] = prepareQueryFieldData(
        schema,
        targetColumn,
        targetRelationId,
        variablesIndex++
      );

      references.push(fieldName);
      variables.push(fieldData);

      continue;
    }

    const [fieldName, fieldData] = prepareQueryFieldData(
      schema,
      fieldKey,
      fieldValue,
      variablesIndex++
    );

    properties.push(`"${fieldKey}"`);
    references.push(fieldName);

    variables.push(fieldData);
  }

  return [properties, references, variables];
};

const prepareQueryFieldData = (
  schema: ObjectSchema,
  fieldKey: string,
  fieldValue: unknown,
  variablesIndex: number
): [string, SqlParameter] => {
  const fieldName = `${variablesIndex}i`;
  const fieldSchema = schema.properties[fieldKey];
  const fieldData = prepareFieldData(fieldName, fieldValue, fieldSchema);

  return [`:${fieldName}`, fieldData];
};
