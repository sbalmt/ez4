import type { Database } from '@ez4/database';
import type { DeepPartial } from '@ez4/utils';

import { isAnyObject } from '@ez4/utils';

type PrepareUpdateResult = [string, unknown[]];

export const prepareUpdateFields = <T extends Database.Schema>(
  data: DeepPartial<T>,
  path?: string
): PrepareUpdateResult => {
  const operations: string[] = [];
  const variables: unknown[] = [];

  for (const fieldKey in data) {
    const fieldValue = data[fieldKey];

    if (fieldValue === undefined) {
      continue;
    }

    const fieldPath = path ? `${path}."${fieldKey}"` : `"${fieldKey}"`;

    if (isAnyObject(fieldValue)) {
      const [nestedOperations, nestedVariables] = prepareUpdateFields(fieldValue, fieldPath);

      operations.push(nestedOperations);
      variables.push(...nestedVariables);

      continue;
    }

    operations.push(`SET ${fieldPath} = ?`);
    variables.push(fieldValue);
  }

  return [operations.join(' '), variables];
};
