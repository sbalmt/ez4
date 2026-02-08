import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryState } from '@ez4/stateful';
import type { IdentityState } from './types';

import { hashData, toKebabCase } from '@ez4/utils';

import { EmailIdentityNotFoundError } from './errors';
import { IdentityServiceType } from './types';

export const createIdentityStateId = (identity: string) => {
  return hashData(IdentityServiceType, toKebabCase(identity));
};

export const isIdentityState = (resource: EntryState): resource is IdentityState => {
  return resource.type === IdentityServiceType;
};

export const getIdentityState = (context: EventContext, identity: string, options: DeployOptions) => {
  const identityState = context.getServiceState(identity, options);

  if (!isIdentityState(identityState)) {
    throw new EmailIdentityNotFoundError(identity);
  }

  return identityState;
};
