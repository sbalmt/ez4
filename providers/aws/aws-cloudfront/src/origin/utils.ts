import type { EntryState, StepContext } from '@ez4/stateful';
import type { OriginState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';

import { OriginServiceType } from './types.js';

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
