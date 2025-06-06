import type { Query, TableMetadata } from '@ez4/database';
import type { AnyObject } from '@ez4/utils';

import { isAnyObject } from '@ez4/utils';

import { isSkippableData } from './data.js';

type PrepareResult = [string, unknown[]];

export const prepareWhereFields = (input: Query.WhereInput<TableMetadata>): PrepareResult => {
  const prepareFields = (data: AnyObject, path?: string): [string[], unknown[]] => {
    const operations: string[] = [];
    const variables: unknown[] = [];

    for (const key in data) {
      const value = data[key];

      if (isSkippableData(value)) {
        continue;
      }

      switch (key) {
        case 'NOT': {
          const [nestedOperations, nestedVariables] = prepareFields(value, path);

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
          if (!(value instanceof Array)) {
            throw new Error(`Field with AND/OR operations must be an array.`);
          }

          const [nestedOperations, nestedVariables] = value.reduce(
            ([allOperations, allVariables], input) => {
              const [operations, variables] = prepareFields(input, path);

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
          const nestedPath = path ? `${path}."${key}"` : `"${key}"`;

          const nestedValue = isAnyObject(value) ? value : value === null ? { isNull: true } : { equal: value };

          const nestedResult = prepareOperation(nestedValue, nestedPath);

          if (!nestedResult) {
            const [nestedOperations, nestedVariables] = prepareFields(value, nestedPath);

            operations.push(...nestedOperations);
            variables.push(...nestedVariables);
          } else {
            const [nestedOperation, ...nestedVariables] = nestedResult;

            operations.push(nestedOperation);
            variables.push(...nestedVariables);
          }
        }
      }
    }

    return [operations, variables];
  };

  const [operations, variables] = prepareFields(input);

  return [operations.join(' AND '), variables];
};

const prepareOperation = (operation: AnyObject, path: string) => {
  const [operator, value] = Object.entries(operation)[0];

  switch (operator) {
    case 'equal':
      return [`${path} = ?`, value];

    case 'not':
      return [`${path} != ?`, value];

    case 'gt':
      return [`${path} > ?`, value];

    case 'gte':
      return [`${path} >= ?`, value];

    case 'lt':
      return [`${path} < ?`, value];

    case 'lte':
      return [`${path} <= ?`, value];

    case 'isIn':
      return [`${path} IN [${value.map(() => '?').join(', ')}]`, ...value];

    case 'isBetween':
      return [`${path} BETWEEN ? AND ?`, ...value];

    case 'isMissing':
      return [`${path} IS ${value ? 'MISSING' : 'NOT MISSING'}`];

    case 'isNull':
      return [`${path} IS ${value ? 'NULL' : 'NOT NULL'}`];

    case 'startsWith':
      return [`begins_with(${path}, ?)`, value];

    case 'contains':
      return [`contains(${path}, ?)`, value];
  }

  return null;
};
