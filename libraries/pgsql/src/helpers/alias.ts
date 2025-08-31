import type { SqlBuilderReferences } from '../main.js';

export const getUniqueAlias = (alias: string, references: SqlBuilderReferences) => {
  const { aliases } = references;

  if (!aliases[alias]) {
    aliases[alias] = 0;
  }

  return `${alias}${aliases[alias]++}`;
};
