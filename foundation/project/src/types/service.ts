import type { AnyObject, Incomplete } from '@ez4/utils';
import type { EntryState } from '@ez4/stateful';

import { isAnyObject, isObjectWith } from '@ez4/utils';

export type LinkedOptions = Record<string, unknown>;

export type LinkedVariables = Record<string, string>;

export type LinkedServices = Record<string, LinkedService>;

export type LinkedService = {
  reference: string;
  options?: LinkedOptions;
};

export type ServiceStates = Record<string, EntryState>;

export type ServiceMetadata = {
  type: string;
  name: string;
  context: Record<string, LinkedContext>;
  options?: LinkedOptions;
  variables?: LinkedVariables;
  services?: LinkedServices;
};

export type ContextSource = {
  options?: LinkedOptions;
  variables?: LinkedVariables;
  services?: LinkedServices;
  dependencyIds?: string[];
  connectionIds?: string[];
  requireVpc?: boolean;
  constructor: string;
  module: string;
  from: string;
};

export type LinkedContext = {
  options?: LinkedOptions;
  context?: Record<string, LinkedContext>;
  dependencyIds?: string[];
  connectionIds?: string[];
  requireVpc?: boolean;
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
