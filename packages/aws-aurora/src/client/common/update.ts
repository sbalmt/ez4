import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { Database, Relations, Query } from '@ez4/database';
import type { AnyObject, DeepPartial } from '@ez4/utils';
import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { SchemaType } from '@ez4/schema';
import { isAnyObject } from '@ez4/utils';

import { prepareSelectFields } from './select.js';
import { prepareWhereFields } from './where.js';
import { isSkippableData, prepareFieldData } from './data.js';

type PrepareResult = [string, SqlParameter[]];

export const prepareUpdateQuery = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.UpdateOneInput<T, S, I, R> | Query.UpdateManyInput<T, S, R>
) => {
  return prepareAllQueries(table, schema, relations, query, null, 0);
};

const prepareAllQueries = (
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.UpdateOneInput<{}, {}, {}, Relations> | Query.UpdateManyInput<{}, {}, Relations>,
  fromTable: string | null,
  variablesIndex: number
): PrepareResult => {
  const [updateFields, updateVariables] = prepareUpdateFields(
    query.data,
    schema,
    relations,
    variablesIndex
  );

  const [relationFields, postStatements, postVariables] = preparePostRelationQueries(
    query.data,
    relations,
    variablesIndex + updateVariables.length
  );

  const updateStatement = [];

  if (!updateFields.length) {
    updateStatement.push(`SELECT ${relationFields.join(', ')} FROM "${table}"`);
  } else {
    updateStatement.push(`UPDATE "${table}" SET ${updateFields}`);

    if (fromTable) {
      updateStatement.push(`FROM ${fromTable}`);
    }
  }

  if (query.where) {
    const [whereFields, whereVariables] = prepareWhereFields(schema, query.where);

    if (whereFields) {
      updateStatement.push(`WHERE ${whereFields}`);
      updateVariables.push(...whereVariables);
    }
  }

  if (query.select) {
    relationFields.push(...prepareSelectFields(query.select, schema, relations));
  }

  if (updateFields.length && relationFields.length) {
    updateStatement.push(`RETURNING ${relationFields.join(', ')}`);
  }

  if (postStatements.length) {
    const allVariables = [...updateVariables, ...postVariables];

    const lastStatement = postStatements.pop();

    const withStatements = [updateStatement.join(' '), ...postStatements]
      .map((statement, index) => `R${index + 1} AS (${statement})`)
      .join(', ');

    const finalStatement = `WITH ${withStatements} ${lastStatement}`;

    return [finalStatement, allVariables];
  }

  return [updateStatement.join(' '), updateVariables];
};

const preparePostRelationQueries = (
  data: AnyObject,
  relations: RepositoryRelationsWithSchema,
  variablesIndex: number
): [string[], string[], SqlParameter[]] => {
  const relationFields = new Set<string>();

  const postStatements = [];
  const postVariables = [];

  const fromTable = `R1`;

  for (const alias in relations) {
    const relationData = data[alias];

    if (!relations[alias] || !isAnyObject(relationData) || Array.isArray(relationData)) {
      continue;
    }

    const { sourceTable, sourceColumn, sourceSchema, targetColumn } = relations[alias];

    if (relationData[targetColumn]) {
      continue;
    }

    const [statement, variables] = prepareAllQueries(
      sourceTable,
      sourceSchema,
      {},
      { data: relationData },
      fromTable,
      variablesIndex + postVariables.length
    );

    postStatements.push(`${statement} WHERE "${sourceColumn}" = ${fromTable}."${targetColumn}"`);

    relationFields.add(`"${targetColumn}"`);
    postVariables.push(...variables);
  }

  return [[...relationFields], postStatements, postVariables];
};

const prepareUpdateFields = <T extends Database.Schema>(
  data: DeepPartial<T>,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  variablesIndex: number
): PrepareResult => {
  const variables: SqlParameter[] = [];
  const operations: string[] = [];

  const prepareAll = (schema: ObjectSchema, data: DeepPartial<T>, path?: string) => {
    for (const fieldKey in data) {
      const fieldValue = data[fieldKey];
      const fieldRelation = relations[fieldKey];

      if (isSkippableData(fieldValue)) {
        continue;
      }

      if (fieldRelation) {
        const { targetColumn, foreign } = fieldRelation;

        const targetRelationId = (fieldValue as AnyObject)[targetColumn];

        if (!foreign || !targetRelationId) {
          continue;
        }

        const [fieldOperation, fieldData] = prepareQueryFieldData(
          schema.properties[targetColumn],
          targetColumn,
          targetRelationId,
          variablesIndex++
        );

        operations.push(fieldOperation);
        variables.push(fieldData);

        continue;
      }

      const fieldPath = path ? `${path}['${fieldKey}']` : `"${fieldKey}"`;

      const fieldSchema = schema.properties[fieldKey];

      const fieldNotNested =
        !isAnyObject(fieldValue) ||
        fieldSchema.type !== SchemaType.Object ||
        fieldSchema.definitions?.extensible ||
        fieldSchema.additional ||
        fieldSchema.nullable ||
        fieldSchema.optional;

      if (fieldNotNested) {
        const [fieldOperation, fieldData] = prepareQueryFieldData(
          fieldSchema,
          fieldPath,
          fieldValue,
          variablesIndex++
        );

        operations.push(fieldOperation);
        variables.push(fieldData);

        continue;
      }

      prepareAll(fieldSchema, fieldValue, fieldPath);
    }
  };

  prepareAll(schema, data);

  return [operations.join(', '), variables];
};

const prepareQueryFieldData = (
  fieldSchema: AnySchema,
  fieldPath: string,
  fieldValue: unknown,
  variablesIndex: number
): [string, SqlParameter] => {
  const fieldName = `${variablesIndex}i`;
  const fieldData = prepareFieldData(fieldName, fieldValue, fieldSchema);

  return [`${fieldPath} = :${fieldName}`, fieldData];
};
