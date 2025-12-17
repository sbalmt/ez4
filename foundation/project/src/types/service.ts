import type { EntryState } from '@ez4/stateful';

import { isAnyObject } from '@ez4/utils';

export type LinkedVariables = Record<string, string>;

export type LinkedServices = Record<string, string>;

export type ServiceAliases = Record<string, EntryState>;

export type ServiceMetadata = {
  type: string;
  name: string;
  context: Record<string, LinkedContext>;
  variables?: LinkedVariables;
  services?: LinkedServices;
};

export type ContextSource = {
  services?: LinkedServices;
  variables?: LinkedVariables;
  dependencyIds?: string[];
  connectionIds?: string[];
  constructor: string;
  callable?: boolean;
  module: string;
  from: string;
};

export type LinkedContext = {
  context?: Record<string, LinkedContext>;
  dependencyIds?: string[];
  connectionIds?: string[];
  constructor: string;
  callable?: boolean;
  module: string;
  from: string;
};

export const isServiceMetadata = (value: unknown): value is ServiceMetadata => {
  return isAnyObject(value) && 'type' in value && 'name' in value;
};
