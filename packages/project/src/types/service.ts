import { EntryState } from '@ez4/stateful';
import { isAnyObject } from '@ez4/utils';

export type LinkedVariables = Record<string, string>;

export type LinkedServices = Record<string, string>;

export type ServiceAliases = Record<string, EntryState>;

export type ServiceMetadata = {
  type: string;
  name: string;
  extras: Record<string, ExtraSource>;
  variables?: LinkedVariables | null;
  services?: LinkedServices | null;
};

export type ExtraSource = {
  entryIds: string[];
  constructor: string;
  module: string;
  from: string;
};

export const isServiceMetadata = (value: unknown): value is ServiceMetadata => {
  return isAnyObject(value) && 'type' in value && 'name' in value;
};
