import type { Database, Query } from '@ez4/database';

import { isAnyObject } from '@ez4/utils';

export const prepareSelectFields = <T extends Database.Schema>(
  fields: Partial<Query.SelectInput<T>>,
  path?: string
): string => {
  const selectFields: string[] = [];

  for (const fieldKey in fields) {
    const fieldValue = fields[fieldKey];

    if (!fieldValue) {
      continue;
    }

    const fieldPath = path ? `${path}."${fieldKey}"` : `"${fieldKey}"`;

    if (isAnyObject(fieldValue)) {
      selectFields.push(prepareSelectFields(fieldValue, fieldPath));
      continue;
    }

    selectFields.push(fieldPath);
  }

  if (selectFields.length) {
    return selectFields.join(', ');
  }

  return '*';
};
