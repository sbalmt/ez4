import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder';
import type { SqlSource } from '../common/source';

export type SqlOperationContext = {
  options: SqlBuilderOptions;
  references?: SqlBuilderReferences;
  insensitive?: boolean;
  source?: SqlSource;
  variables: unknown[];
  field?: string;
  path?: string;
};
