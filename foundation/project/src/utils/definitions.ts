import type { EntryState } from '@ez4/stateful';

import { isAnyObject, toSnakeCase } from '@ez4/utils';

export type EntryResults<T extends EntryState> = keyof NonNullable<T['result']>;

export const getDefinitionName = <T extends EntryState>(entryId: string, name: EntryResults<T>) => {
  return `__EZ4_${toSnakeCase(`${entryId}_${name.toString()}`).toUpperCase()}`;
};

export const getDefinitionsObject = (entries: EntryState[]) => {
  const definitions: Record<string, string> = {};

  for (const { entryId, result } of entries) {
    if (!isAnyObject(result)) {
      continue;
    }

    for (const key in result) {
      const name = getDefinitionName(entryId, key as EntryResults<EntryState>);

      definitions[name] = `"${result[key]}"`;
    }
  }

  return definitions;
};
