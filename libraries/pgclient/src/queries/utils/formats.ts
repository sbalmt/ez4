import type { AnySchema } from '@ez4/schema';
import type { SqlSource } from '@ez4/pgsql';

import { escapeSqlName, mergeSqlAlias } from '@ez4/pgsql';
import { isStringSchema } from '@ez4/schema';

const ColumnFormats: Record<string, string> = {
  ['date-time']: `'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'`,
  ['time']: `'HH24:MI:SS.MS"Z"'`,
  ['date']: `'YYYY-MM-DD'`
};

export const getFormattedColumn = (column: string, schema: AnySchema) => {
  if (isStringSchema(schema)) {
    const columnMask = schema.format ? ColumnFormats[schema.format] : undefined;

    if (columnMask) {
      const columnName = escapeSqlName(column);

      return (source?: SqlSource) => {
        return formatColumn(columnName, columnMask, source);
      };
    }
  }

  return column;
};

const formatColumn = (columnName: string, columnMask: string, source?: SqlSource) => {
  const columnPath = mergeSqlAlias(columnName, source?.alias);
  const expression = `to_char(${columnPath}, ${columnMask})`;

  return expression;
};
