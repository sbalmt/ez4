import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { Database, Relations, Query } from '@ez4/database';
import type { SqlJsonColumnSchema, SqlStatement } from '@ez4/pgsql';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { isAnyNumber, isAnyObject, isEmptyObject } from '@ez4/utils';
import { escapeSqlName, mergeSqlAlias, SqlBuilder } from '@ez4/pgsql';
import { isObjectSchema, isStringSchema } from '@ez4/schema';
import { Index } from '@ez4/database';

import { InvalidRelationFieldError, MissingFieldSchemaError } from './errors.js';
import { detectFieldData, prepareFieldData } from './data.js';

const Sql = new SqlBuilder({
  onPrepareVariable: (value, index, schema) => {
    if (schema) {
      return prepareFieldData(`${index}`, value, schema);
    }

    return detectFieldData(`${index}`, value);
  }
});

const Formats: Record<string, string> = {
  ['date-time']: `'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'`,
  ['time']: `'HH24:MI:SS.MS"Z"'`,
  ['date']: `'YYYY-MM-DD'`
};

export const prepareSelectQuery = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.FindOneInput<T, S, I, R> | Query.FindManyInput<T, S, I, R>
): [string, SqlParameter[]] => {
  const selectQuery = Sql.reset().select(schema).from(table).where(query.where);

  selectQuery.record(getSelectFields(query.select, schema, relations, selectQuery));

  if ('order' in query) {
    selectQuery.order(query.order);
  }

  if ('cursor' in query && isAnyNumber(query.cursor)) {
    selectQuery.skip(query.cursor);
  }

  if ('limit' in query && isAnyNumber(query.limit)) {
    selectQuery.take(query.limit);
  }

  const [statement, variables] = selectQuery.build();

  return [statement, variables as SqlParameter[]];
};

export const getSelectFields = <T extends Database.Schema, R extends Relations>(
  fields: Partial<Query.SelectInput<T, R>>,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  statement: SqlStatement,
  inner?: boolean
) => {
  const allFields = isEmptyObject(fields) ? getDefaultFields(schema) : fields;
  const output: SqlJsonColumnSchema = {};

  for (const fieldKey in allFields) {
    const fieldValue = allFields[fieldKey];

    if (!fieldValue) {
      continue;
    }

    const relationData = relations[fieldKey];

    if (relationData) {
      const { sourceTable, sourceColumn, sourceSchema, sourceIndex, targetColumn } = relationData;

      const relationFields = fieldValue === true ? getDefaultFields(sourceSchema) : fieldValue;

      if (!isAnyObject(relationFields)) {
        throw new InvalidRelationFieldError(fieldKey);
      }

      statement.as('R');

      const relationQuery = Sql.select(sourceSchema)
        .where({ [sourceColumn]: statement.reference(targetColumn) })
        .from(sourceTable);

      const relationRecord = getSelectFields(
        relationFields,
        sourceSchema,
        relations,
        relationQuery,
        true
      );

      if (sourceIndex !== Index.Secondary) {
        relationQuery.objectColumn(relationRecord);
      } else {
        relationQuery.arrayColumn(relationRecord);
      }

      output[fieldKey] = relationQuery;
      continue;
    }

    const fieldSchema = schema.properties[fieldKey];

    if (!fieldSchema) {
      throw new MissingFieldSchemaError(fieldKey);
    }

    if (isObjectSchema(fieldSchema)) {
      output[fieldKey] = fieldValue;
      continue;
    }

    const fieldColumn = getFieldColumn(fieldKey, fieldSchema, !inner);

    if (fieldColumn instanceof Function) {
      output[fieldKey] = statement.reference(fieldColumn);
    } else {
      output[fieldKey] = true;
    }
  }

  return output;
};

const getDefaultFields = (schema: ObjectSchema) => {
  const fields: Record<string, boolean> = {};

  for (const fieldKey in schema.properties) {
    fields[fieldKey] = true;
  }

  return fields;
};

const getFieldColumn = (column: string, schema: AnySchema, alias?: boolean) => {
  if (!isStringSchema(schema)) {
    return column;
  }

  const columnMask = schema.format ? Formats[schema.format] : undefined;

  if (!columnMask) {
    return column;
  }

  const columnName = escapeSqlName(column);

  return (statement: SqlStatement) => {
    const columnPath = mergeSqlAlias(columnName, statement.alias);
    const columnResult = `to_char(${columnPath}, ${columnMask})`;

    if (alias) {
      return `${columnResult} AS ${columnName}`;
    }

    return columnResult;
  };
};
