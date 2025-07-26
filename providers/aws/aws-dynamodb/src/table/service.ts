import type { EntryState, EntryStates } from '@ez4/stateful';
import type { TableParameters, TableState } from './types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { TableServiceType } from './types.js';

export const createTable = <E extends EntryState>(state: EntryStates<E>, parameters: TableParameters) => {
  const tableName = toKebabCase(parameters.tableName);
  const tableId = hashData(TableServiceType, tableName);

  return attachEntry<E | TableState, TableState>(state, {
    type: TableServiceType,
    entryId: tableId,
    dependencies: [],
    parameters: {
      ...parameters,
      tableName
    }
  });
};
