import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder.js';
import type { SqlSource } from '../main.js';

export type SqlOperationContext = {
  options: SqlBuilderOptions;
  references: SqlBuilderReferences;
  insensitive?: boolean;
  source: SqlSource;
  variables: unknown[];
  parent?: string;
};
