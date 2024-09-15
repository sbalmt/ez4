import type { EntryState, StepContext } from '@ez4/stateful';
import type { AccessState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';

import { AccessServiceType } from './types.js';

export const getAccessId = <E extends EntryState>(
  serviceName: string,
  resourceId: string,
  context: StepContext<E | AccessState>
) => {
  const resource = context.getDependencies(AccessServiceType).at(0)?.result;

  if (!resource?.accessId) {
    throw new IncompleteResourceError(serviceName, resourceId, 'accessId');
  }

  return resource.accessId;
};
