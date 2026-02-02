import type { AnyObject, Incomplete } from '@ez4/utils';
import type { EntryState } from '@ez4/stateful';

import { isAnyObject, isObjectWith } from '@ez4/utils';

export type LinkedVariables = Record<string, string>;

export type LinkedServices = Record<string, string>;

export type ServiceStates = Record<string, EntryState>;

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
  module: string;
  from: string;
};

export type LinkedContext = {
  context?: Record<string, LinkedContext>;
  dependencyIds?: string[];
  connectionIds?: string[];
  constructor: string;
  module: string;
  from: string;
};

export const isServiceMetadata = (value: unknown): value is ServiceMetadata => {
  return isAnyObject(value) && isObjectWith(value, ['type', 'name']);
};

export const createServiceMetadata = <T extends AnyObject>(type: string, name: string) => {
  return { type, name, context: {} } as ServiceMetadata & Incomplete<T>;
};
