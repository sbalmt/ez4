import type { SqlBuilderReferences } from '../builder';

export const getUniqueAlias = (alias: string, references: SqlBuilderReferences) => {
  const { aliases } = references;

  if (!aliases[alias]) {
    aliases[alias] = 0;
  }

  return `${alias}${aliases[alias]++}`;
};
