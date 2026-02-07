import type { EntryState } from '@ez4/stateful';
import type { IdentityState } from './types';

import { hashData, toKebabCase } from '@ez4/utils';

import { IdentityServiceType } from './types';

export const createIdentityStateId = (identity: string) => {
  return hashData(IdentityServiceType, toKebabCase(identity));
};

export const isIdentityState = (resource: EntryState): resource is IdentityState => {
  return resource.type === IdentityServiceType;
};
