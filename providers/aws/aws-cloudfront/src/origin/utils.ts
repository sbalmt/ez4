import type { EntryState, StepContext } from '@ez4/stateful';
import type { OriginState } from './types';

import { IncompleteResourceError } from '@ez4/aws-common';

import { OriginServiceType } from './types';

const MANAGED_ORIGIN_ID_PREFIX = '@ez4';

export const getManagedOriginId = (name: string) => {
  return `${MANAGED_ORIGIN_ID_PREFIX}/${name}`;
};

export const isManagedOriginId = (originId: string) => {
  return originId.startsWith(`${MANAGED_ORIGIN_ID_PREFIX}/`);
};

export const isOriginPolicyState = (resource: EntryState): resource is OriginState => {
  return resource.type === OriginServiceType;
};

export const getOriginPolicyId = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<OriginState>(OriginServiceType).at(0)?.result;

  if (!resource?.policyId) {
    throw new IncompleteResourceError(serviceName, resourceId, 'policyId');
  }

  return resource.policyId;
};
