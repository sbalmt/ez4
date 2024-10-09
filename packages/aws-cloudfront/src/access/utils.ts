import type { EntryState, StepContext } from '@ez4/stateful';
import type { AccessState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';

import { AccessServiceType } from './types.js';

export const isOriginAccessState = (resource: EntryState): resource is AccessState => {
  return resource.type === AccessServiceType;
};

export const getOriginAccessId = (
  serviceName: string,
  resourceId: string,
  context: StepContext
) => {
  const resource = context.getDependencies<AccessState>(AccessServiceType).at(0)?.result;

  if (!resource?.accessId) {
    throw new IncompleteResourceError(serviceName, resourceId, 'accessId');
  }

  return resource.accessId;
};
