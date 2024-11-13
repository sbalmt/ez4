import type { AnyObject } from '@ez4/utils';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { Database, Relations, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { isAnyObject } from '@ez4/utils';

import { prepareFieldData } from './data.js';

type PrepareResult = [string, SqlParameter[]];

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
  const prepareAll = (
    table: string,
    data: AnyObject,
    schema: ObjectSchema,
    relations: RepositoryRelationsWithSchema,
    index: number
  ): PrepareResult => {
    const relationStatements = [];
    const relationVariables = [];
    const relationFields = [];

    let relationCounter = 0;

    for (const alias in relations) {
      const relationData = data[alias];

      if (!relations[alias] || !isAnyObject(relationData) || Array.isArray(relationData)) {
        continue;
      }

      const { sourceTable, sourceColumn, sourceSchema, targetAlias } = relations[alias];

      const [statement, variables] = prepareAll(
        sourceTable,
        relationData,
        sourceSchema,
        {},
        index + relationVariables.length
      );

      const fields = [`"${sourceColumn}" AS "${targetAlias}"`, ...relationFields];

      const name = `R${++relationCounter}`;

      relationStatements.push(`${name} AS (${statement} RETURNING ${fields.join(', ')})`);

      relationFields.push(`${name}."${targetAlias}"`);

      relationVariables.push(...variables);
    }

    const [insertFields, insertParameters, insertVariables] = prepareInsertFields(
      data,
      schema,
      relations,
      index + relationVariables.length
    );

    if (relationStatements.length) {
      const variables = [...relationVariables, ...insertVariables];

      const statement =
        `WITH ${relationStatements.join(', ')} ` +
        `INSERT INTO "${table}" (${insertFields}) ` +
        `SELECT ${insertParameters} FROM R${relationCounter}`;

      return [statement, variables];
    }

    const statement = `INSERT INTO "${table}" (${insertFields}) VALUES (${insertParameters})`;

    return [statement, insertVariables];
  };

  return prepareAll(table, query.data, schema, relations, 0);
};

const prepareInsertFields = <T extends Database.Schema>(
  data: T,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  index = 0
): [string, ...PrepareResult] => {
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
      const { targetAlias, targetColumn } = fieldRelation;

      properties.push(`"${targetColumn}"`);
      references.push(`"${targetAlias}"`);

      continue;
    }

    const fieldSchema = schema.properties[fieldKey];

    if (!fieldSchema) {
      throw new Error(`Field schema for ${fieldKey} doesn't exists.`);
    }

    const fieldName = `${index++}i`;
    const fieldData = prepareFieldData(fieldName, fieldValue, fieldSchema);

    properties.push(`"${fieldKey}"`);
    references.push(`:${fieldName}`);

    variables.push(fieldData);
  }

  return [properties.join(', '), references.join(', '), variables];
};
