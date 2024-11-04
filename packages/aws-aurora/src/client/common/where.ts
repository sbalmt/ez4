import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { Database, Query } from '@ez4/database';
import type { AnyObject } from '@ez4/utils';

import { SchemaTypeName } from '@ez4/schema';
import { isAnyObject } from '@ez4/utils';

import { prepareFieldData } from './data.js';

type PrepareResult = [string, SqlParameter[]];

export const prepareWhereFields = <T extends Database.Schema>(
  schema: ObjectSchema,
  query: Query.WhereInput<T, any>
): PrepareResult => {
  const prepareAll = (
    data: AnyObject,
    schema: ObjectSchema,
    index: number = 0,
    path?: string
  ): [string[], SqlParameter[]] => {
    const operations: string[] = [];
    const variables: SqlParameter[] = [];

    for (const key in data) {
      const fieldValue = data[key];

      if (fieldValue === undefined || fieldValue === null) {
        continue;
      }

      switch (key) {
        case 'NOT': {
          const [nestedOperations, nestedVariables] = prepareAll(fieldValue, schema, index, path);

          if (nestedOperations.length > 1) {
            operations.push(`NOT (${nestedOperations.join(' AND ')})`);
          } else {
            operations.push(`NOT ${nestedOperations[0]})`);
          }

          variables.push(...nestedVariables);
          break;
        }

        case 'AND':
        case 'OR': {
          if (!(fieldValue instanceof Array)) {
            throw new Error(`Field with AND/OR operations must be an array.`);
          }

          const [nestedOperations, nestedVariables] = fieldValue.reduce(
            ([allOperations, allVariables], data) => {
              const [operations, variables] = prepareAll(
                data,
                schema,
                index + allVariables.length,
                path
              );

              if (key === 'OR' && operations.length > 1) {
                allOperations.push(`(${operations.join(' AND ')})`);
              } else {
                allOperations.push(...operations);
              }

              allVariables.push(...variables);

              return [allOperations, allVariables];
            },
            [[], []]
          );

          if (key === 'OR' && nestedOperations.length > 1) {
            operations.push(`(${nestedOperations.join(` ${key} `)})`);
          } else {
            operations.push(...nestedOperations);
          }

          variables.push(...nestedVariables);
          break;
        }

        default: {
          const fieldSchema = schema.properties[key];

          if (!fieldSchema) {
            throw new Error(`Field schema for ${key} doesn't exists.`);
          }

          const nestedPath = path ? `${path}['${key}']` : `"${key}"`;
          const fieldIndex = index + variables.length;

          if (fieldSchema.type === SchemaTypeName.Object) {
            const [nestedOperations, nestedVariables] = prepareAll(
              fieldValue,
              fieldSchema,
              fieldIndex,
              nestedPath
            );

            operations.push(...nestedOperations);
            variables.push(...nestedVariables);
          } else {
            const [nestedOperation, ...nestedVariables] = prepareOperation(
              isAnyObject(fieldValue) ? fieldValue : { equal: fieldValue },
              fieldIndex,
              fieldSchema,
              nestedPath
            );

            operations.push(nestedOperation);
            variables.push(...nestedVariables);
          }
        }
      }
    }

    return [operations, variables];
  };

  const [operations, variables] = prepareAll(query, schema);

  return [operations.join(' AND '), variables];
};

const prepareOperation = (operation: AnyObject, index: number, schema: AnySchema, path: string) => {
  const [operator, value] = Object.entries(operation)[0];

  switch (operator) {
    case 'equal':
      return [`${path} = :${index}`, prepareFieldData(`${index}`, value, schema)];

    case 'not':
      return [`${path} != :${index}`, prepareFieldData(`${index}`, value, schema)];

    case 'gt':
      return [`${path} > :${index}`, prepareFieldData(`${index}`, value, schema)];

    case 'gte':
      return [`${path} >= :${index}`, prepareFieldData(`${index}`, value, schema)];

    case 'lt':
      return [`${path} < :${index}`, prepareFieldData(`${index}`, value, schema)];

    case 'lte':
      return [`${path} <= :${index}`, prepareFieldData(`${index}`, value, schema)];

    case 'isIn':
      return [
        `${path} IN (${value.map((_: unknown, n: number) => `:${index + n}`).join(', ')})`,
        ...value.map((item: unknown, n: number) => {
          return prepareFieldData(`${index + n}`, item, schema);
        })
      ];

    case 'isBetween':
      return [
        `${path} BETWEEN :${index} AND :${index + 1}`,
        prepareFieldData(`${index}`, value[0], schema),
        prepareFieldData(`${index + 1}`, value[1], schema)
      ];

    case 'isMissing':
    case 'isNull':
      return [`${path} IS ${value ? 'NULL' : 'NOT NULL'}`];

    case 'startsWith':
      return [`${path} LIKE :${index} || '%'`, prepareFieldData(`${index}`, value, schema)];

    case 'contains':
      return [`${path} LIKE '%' || :${index} || '%'`, prepareFieldData(`${index}`, value, schema)];

    default:
      throw new Error(`Operation ${operation} isn't supported.`);
  }
};
