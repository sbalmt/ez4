import type { EntryState } from '@ez4/stateful';

import { toCamelCase } from '@ez4/utils';

export const getDefinitionName = (entryId: string, name: string) => {
  return `__EZ4_${entryId.toUpperCase()}_${toCamelCase(name).toUpperCase()}`;
};

export const getDefinitionsObject = (entries: EntryState[]) => {
  const definitions: Record<string, string> = {};

  for (const { entryId, result } of entries) {
    if (!result) {
      continue;
    }

    for (const key in result) {
      const value = (result as Record<string, any>)[key];
      const name = getDefinitionName(entryId, key);

      definitions[name] = `"${value}"`;
    }
  }

  return definitions;
};
