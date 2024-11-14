import type { AnyObject } from '@ez4/utils';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { Database, Relations, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { isAnyObject } from '@ez4/utils';

import { prepareFieldData } from './data.js';

type PrepareQueryResult = [string, SqlParameter[]];

type PrepareRelationResult = [string[], SqlParameter[]];

export const prepareInsertQuery = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.InsertOneInput<T, I, R>
) => {
  return prepareAllQueries(table, query.data, schema, relations, null, 0);
};

const prepareAllQueries = (
  table: string,
  data: AnyObject,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  from: string | null,
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

  const [postStatements, postVariables, postFields] = preparePostRelationQueries(
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

    if (postFields.length) {
      insertStatement.push(`RETURNING ${postFields.join(', ')}`);
    }

    allStatements.push(insertStatement.join(' '), ...postStatements);

    const lastStatement = allStatements.pop();

    const withStatements = allStatements
      .map((statement, index) => `R${index + 1} AS (${statement})`)
      .join(', ');

    const finalStatement = `WITH ${withStatements} ${lastStatement}`;

    return [finalStatement, allVariables];
  }

  if (from) {
    insertStatement.push(`SELECT ${insertParameters.join(', ')} FROM ${from}`);
  } else {
    insertStatement.push(`VALUES (${insertParameters.join(', ')})`);
  }

  return [insertStatement.join(' '), insertVariables];
};

const preparePreRelationQueries = (
  data: AnyObject,
  relations: RepositoryRelationsWithSchema,
  variablesIndex: number
): PrepareRelationResult => {
  const preStatements = [];
  const preVariables = [];

  let aliasesIndex = 0;

  for (const alias in relations) {
    const relationData = data[alias];

    if (!relations[alias] || !isAnyObject(relationData) || Array.isArray(relationData)) {
      continue;
    }

    const { sourceTable, sourceColumn, sourceSchema, targetAlias } = relations[alias];

    const nextIndex = variablesIndex + preVariables.length;

    const [statement, variables] = prepareAllQueries(
      sourceTable,
      relationData,
      sourceSchema,
      {},
      null,
      nextIndex
    );

    const relationFields = [`"${sourceColumn}" AS "${targetAlias}"`];

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
): [...PrepareRelationResult, string[]] => {
  const relationFields = new Set<string>();

  const postStatements = [];
  const postVariables = [];

  for (const alias in relations) {
    const relationDataList = data[alias];

    if (!relations[alias] || !Array.isArray(relationDataList)) {
      continue;
    }

    const { sourceColumn, sourceTable, sourceSchema, targetColumn } = relations[alias];

    relationFields.add(`"${targetColumn}"`);

    for (const relationData of relationDataList) {
      const nextIndex = variablesIndex + postVariables.length;

      const previousName = `R${aliasesIndex}`;

      const [statement, variables] = prepareAllQueries(
        sourceTable,
        relationData,
        sourceSchema,
        {},
        previousName,
        nextIndex,
        [`"${sourceColumn}"`],
        [`"${targetColumn}"`]
      );

      postStatements.push(`${statement} RETURNING ${previousName}.*`);
      postVariables.push(...variables);

      aliasesIndex++;
    }
  }

  return [postStatements, postVariables, [...relationFields]];
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

    if (fieldValue === undefined) {
      continue;
    }

    if (fieldRelation) {
      const { targetAlias, targetColumn, foreign } = fieldRelation;

      if (foreign) {
        properties.push(`"${targetColumn}"`);
        references.push(`"${targetAlias}"`);
      }

      continue;
    }

    const fieldSchema = schema.properties[fieldKey];

    if (!fieldSchema) {
      throw new Error(`Field schema for ${fieldKey} doesn't exists.`);
    }

    const fieldName = `${variablesIndex}i`;
    const fieldData = prepareFieldData(fieldName, fieldValue, fieldSchema);

    properties.push(`"${fieldKey}"`);
    references.push(`:${fieldName}`);

    variables.push(fieldData);

    variablesIndex++;
  }

  return [properties, references, variables];
};
