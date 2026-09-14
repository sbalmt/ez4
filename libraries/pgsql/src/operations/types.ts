import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder';
import type { SqlSource } from '../common/source';

export type SqlOperationContext = {
  options: SqlBuilderOptions;
  references?: SqlBuilderReferences;
  flags?: SqlOperationFlags;
  source?: SqlSource;
  variables: unknown[];
  field?: string;
  path?: string;
};

export type SqlOperationFlags = {
  insensitive?: boolean;
  count?: boolean;
};
