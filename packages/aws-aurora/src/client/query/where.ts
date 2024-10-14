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
  query: Query.WhereInput<T, never>
): PrepareResult => {
  const prepare = (
    data: AnyObject,
    schema: ObjectSchema,
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
          const [nestedOperations, nestedVariables] = prepare(fieldValue, schema, path);

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
              const [operations, variables] = prepare(data, schema, path);

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
          const nestedPath = path ? `${path}['${key}']` : `"${key}"`;
          const fieldSchema = schema.properties[key];

          if (!fieldSchema) {
            throw new Error(`Field schema for ${key} doesn't exists.`);
          }

          if (fieldSchema.type === SchemaTypeName.Object) {
            const [nestedOperations, nestedVariables] = prepare(
              fieldValue,
              fieldSchema,
              nestedPath
            );

            operations.push(...nestedOperations);
            variables.push(...nestedVariables);
          } else {
            const [nestedOperation, ...nestedVariables] = prepareOperation(
              isAnyObject(fieldValue) ? fieldValue : { equal: fieldValue },
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

  const [operations, variables] = prepare(query, schema);

  return [operations.join(' AND '), variables];
};

const prepareOperation = (operation: AnyObject, schema: AnySchema, path: string) => {
  const [operator, value] = Object.entries(operation)[0];

  switch (operator) {
    case 'equal':
      return [`${path} = ?`, prepareFieldData(value, schema)];

    case 'not':
      return [`${path} != ?`, prepareFieldData(value, schema)];

    case 'gt':
      return [`${path} > ?`, prepareFieldData(value, schema)];

    case 'gte':
      return [`${path} >= ?`, prepareFieldData(value, schema)];

    case 'lt':
      return [`${path} < ?`, prepareFieldData(value, schema)];

    case 'lte':
      return [`${path} <= ?`, prepareFieldData(value, schema)];

    case 'isIn':
      return [
        `${path} IN (${value.map(() => '?').join(', ')})`,
        ...value.map((element: unknown) => prepareFieldData(element, schema))
      ];

    case 'isBetween':
      return [
        `${path} BETWEEN ? AND ?`,
        prepareFieldData(value[0], schema),
        prepareFieldData(value[1], schema)
      ];

    case 'isMissing':
    case 'isNull':
      return [`${path} IS ${value ? 'NULL' : 'NOT NULL'}`];

    case 'startsWith':
      return [`${path} LIKE ? || '%'`, prepareFieldData(value, schema)];

    case 'contains':
      return [`${path} LIKE '%' || ? || '%'`, prepareFieldData(value, schema)];

    default:
      throw new Error(`Operation ${operation} isn't supported.`);
  }
};
