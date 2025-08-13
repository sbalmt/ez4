import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder.js';
import type { SqlSource } from '../common/source.js';

export type SqlOperationContext = {
  options: SqlBuilderOptions;
  references: SqlBuilderReferences;
  insensitive?: boolean;
  source: SqlSource;
  variables: unknown[];
  parent?: string;
};
