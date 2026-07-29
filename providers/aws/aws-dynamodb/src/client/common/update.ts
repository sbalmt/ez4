import type { AnySchema, NumberSchema, ObjectSchema, UnionSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { Query } from '@ez4/database';
import type { InternalTableMetadata } from '../types';

import { InvalidAtomicOperation, InvalidFieldSchemaError } from '@ez4/aws-dynamodb/runtime';
import { getOptionalSchema, getSchemaProperty, isNullishSchema, isNumberSchema, isObjectSchema, isUnionSchema } from '@ez4/schema';
import { arrayUnique, isAnyObject, isNullish } from '@ez4/utils';

import { getWithSchemaValidation, isDynamicObjectField, isDynamicUnionField, validateRecordSchema } from './schema';
import { prepareWhereFields } from './where';

type PrepareResult = [string, unknown[]];

export const prepareUpdate = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  indexes: string[][],
  query: Query.UpdateOneInput<S, T> | Query.UpdateManyInput<S, T>
): Promise<PrepareResult> => {
  const uniqueIndexes = arrayUnique(...indexes);

  const [updateFields, variables] = await prepareUpdateFields(query.data, schema, uniqueIndexes);

  const statement = [`UPDATE "${table}" ${updateFields || `REMOVE "__EZ4_NOOP"`}`];

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

const prepareUpdateFields = async (
  data: AnyObject,
  schema: ObjectSchema | UnionSchema,
  indexes: string[],
  path?: string
): Promise<PrepareResult> => {
  const operations: string[] = [];
  const variables: unknown[] = [];

  for (const fieldKey in data) {
    const fieldValue = data[fieldKey];

    if (fieldValue === undefined) {
      continue;
    }

    const fieldSchema = getSchemaProperty(schema, fieldKey);

    const fieldPath = path ? `${path}."${fieldKey}"` : `"${fieldKey}"`;

    // Skip values that aren't mapped and isn't part of any dynamic table schema.
    if (!fieldSchema) {
      if (isDynamicUnionField(schema)) {
        operations.push(`SET ${fieldPath} = ?`);
        variables.push(fieldValue);
      }

      continue;
    }

    if (fieldValue === null && isNullishSchema(fieldSchema)) {
      if (!indexes.includes(fieldKey)) {
        operations.push(`SET ${fieldPath} = null`);
        continue;
      }

      // Remove null indexes since DynamoDB doesn't allow it.
      operations.push(`REMOVE ${fieldPath}`);
      continue;
    }

    if (!isAnyObject(fieldValue)) {
      operations.push(`SET ${fieldPath} = ?`);
      variables.push(await getWithSchemaValidation(fieldValue, fieldSchema, fieldPath));
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

    if (isDynamicObjectField(fieldSchema)) {
      const dynamicValue = await getWithSchemaValidation<AnyObject>(fieldValue, getOptionalSchema(fieldSchema), fieldPath);

      for (const dynamicField in dynamicValue) {
        const value = dynamicValue[dynamicField];

        if (value !== undefined) {
          operations.push(`SET ${fieldPath}."${dynamicField}" = ?`);
          variables.push(value);
        }
      }

      continue;
    }

    if (isObjectSchema(fieldSchema) || isUnionSchema(fieldSchema)) {
      const nestedValue = await prepareUpdateFields(fieldValue, getOptionalSchema(fieldSchema), [], fieldPath);

      const [nestedOperations, nestedVariables] = nestedValue;

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
