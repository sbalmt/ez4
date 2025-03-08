import type { EntryState } from '@ez4/stateful';
import type { AnyObject } from '@ez4/utils';

import { toCamelCase } from '@ez4/utils';

export type EntryResults<T extends EntryState> = keyof NonNullable<T['result']>;

export const getDefinitionName = <T extends EntryState>(entryId: string, name: EntryResults<T>) => {
  return `__EZ4_${entryId.toUpperCase()}_${toCamelCase(name.toString()).toUpperCase()}`;
};

export const getDefinitionsObject = (entries: EntryState[]) => {
  const definitions: Record<string, string> = {};

  for (const { entryId, result } of entries) {
    if (!result) {
      continue;
    }

    for (const key in result) {
      const value = (result as AnyObject)[key];
      const name = getDefinitionName(entryId, key as EntryResults<EntryState>);

      definitions[name] = `"${value}"`;
    }
  }

  return definitions;
};
