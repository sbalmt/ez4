import type { AnySchema, NumberSchema, ObjectSchema, UnionSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { Query } from '@ez4/database';
import type { InternalTableMetadata } from '../types';

import { InvalidAtomicOperation, InvalidFieldSchemaError } from '@ez4/aws-dynamodb/runtime';
import { getOptionalSchema, getSchemaProperty, isNumberSchema, isObjectSchema, isUnionSchema } from '@ez4/schema';
import { isAnyObject, isNullish } from '@ez4/utils';

import { getWithSchemaValidation, isDynamicFieldSchema, validateRecordSchema } from './schema';
import { prepareWhereFields } from './where';

type PrepareResult = [string, unknown[]];

export const prepareUpdate = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  query: Query.UpdateOneInput<S, T> | Query.UpdateManyInput<S, T>
): Promise<PrepareResult> => {
  const [updateFields, variables] = await prepareUpdateFields(query.data, schema);

  const statement = [`UPDATE "${table}" ${updateFields}`];

  if (query.where) {
    const [whereFields, whereVariables] = prepareWhereFields(query.where, schema);

    if (whereFields) {
      statement.push(`WHERE ${whereFields}`);
      variables.push(...whereVariables);
    }
  }

  if (query.select) {
    statement.push('RETURNING ALL OLD *');
  }

  return [statement.join(' '), variables];
};

const prepareUpdateFields = async (data: AnyObject, schema: ObjectSchema | UnionSchema, path?: string): Promise<PrepareResult> => {
  const operations: string[] = [];
  const variables: unknown[] = [];

  for (const fieldKey in data) {
    const fieldValue = data[fieldKey];

    if (fieldValue === undefined) {
      continue;
    }

    const fieldSchema = getSchemaProperty(schema, fieldKey);

    // Skip values that aren't mapped in the table schema.
    if (!fieldSchema) {
      continue;
    }

    const fieldPath = path ? `${path}."${fieldKey}"` : `"${fieldKey}"`;

    if (!isAnyObject(fieldValue)) {
      operations.push(`SET ${fieldPath} = ?`);
      variables.push(fieldValue);
      continue;
    }

    if (isNumberSchema(fieldSchema)) {
      const atomicResult = await getAtomicNumberOperationUpdate(fieldKey, fieldValue, fieldSchema, fieldPath);

      if (atomicResult) {
        const [statement, variable] = atomicResult;

        operations.push(statement);
        variables.push(variable);

        continue;
      }
    }

    const atomicOperation = await getAtomicObjectOperationUpdate(fieldValue, fieldSchema, fieldPath);

    if (atomicOperation) {
      const [nestedOperations, nestedVariables] = atomicOperation;

      operations.push(nestedOperations);
      variables.push(...nestedVariables);

      continue;
    }

    if (isDynamicFieldSchema(fieldSchema)) {
      const nestedValues = await getWithSchemaValidation<AnyObject>(fieldValue, getOptionalSchema(fieldSchema), fieldPath);

      for (const nestedKey in nestedValues) {
        const value = nestedValues[nestedKey];

        if (value !== undefined) {
          operations.push(`SET ${fieldPath}."${nestedKey}" = ?`);
          variables.push(value);
        }
      }

      continue;
    }

    if (isObjectSchema(fieldSchema) || isUnionSchema(fieldSchema)) {
      const [nestedOperations, nestedVariables] = await prepareUpdateFields(fieldValue, getOptionalSchema(fieldSchema), fieldPath);

      operations.push(nestedOperations);
      variables.push(...nestedVariables);

      continue;
    }

    throw new InvalidFieldSchemaError(fieldPath);
  }

  return [operations.join(' '), variables];
};

const getAtomicNumberOperationUpdate = async (fieldKey: string, fieldValue: AnyObject, fieldSchema: NumberSchema, fieldPath: string) => {
  for (const operation in fieldValue) {
    const value = fieldValue[operation];

    if (isNullish(value)) {
      continue;
    }

    switch (operation) {
      default: {
        throw new InvalidAtomicOperation(`${fieldPath}.${fieldKey}`);
      }

      case 'removeFrom': {
        return undefined;
      }

      case 'increment': {
        await validateRecordSchema(value, fieldSchema, fieldPath);

        return [`SET ${fieldPath} = (${fieldPath} + ?)`, value] as const;
      }

      case 'decrement': {
        await validateRecordSchema(value, fieldSchema, fieldPath);

        return [`SET ${fieldPath} = (${fieldPath} - ?)`, value] as const;
      }
    }
  }

  return undefined;
};

export const getAtomicObjectOperationUpdate = async (
  fieldValue: AnyObject,
  fieldSchema: AnySchema,
  fieldPath: string
): Promise<PrepareResult | undefined> => {
  for (const operation in fieldValue) {
    const value = fieldValue[operation];

    switch (operation) {
      default:
        return undefined;

      case 'replaceWith': {
        if (value !== undefined) {
          return [`SET ${fieldPath} = ?`, [await getWithSchemaValidation(value, fieldSchema, fieldPath)]];
        }

        return ['', []];
      }

      case 'removeFrom': {
        if (value) {
          return [`REMOVE ${fieldPath}`, []];
        }

        return ['', []];
      }
    }
  }

  return undefined;
};
