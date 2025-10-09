import type { EntryState } from '@ez4/stateful';

import { isAnyObject, toSnakeCase } from '@ez4/utils';

export type EntryProperties<T extends EntryState> = keyof NonNullable<T['result']>;

export const getDefinitionName = <T extends EntryState>(entryId: string, property: EntryProperties<T>) => {
  return `__EZ4_${toSnakeCase(`${entryId}_${property.toString()}`).toUpperCase()}`;
};

export const getDefinitionsObject = (entries: EntryState[]) => {
  const definitions: Record<string, string> = {};

  for (const { entryId, result } of entries) {
    if (!isAnyObject(result)) {
      continue;
    }

    for (const property in result) {
      const name = getDefinitionName(entryId, property as EntryProperties<EntryState>);

      definitions[name] = `"${result[property]}"`;
    }
  }

  return definitions;
};
