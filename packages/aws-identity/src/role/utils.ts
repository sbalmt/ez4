import type { EntryState, StepContext } from '@ez4/stateful';

import { IncompleteResourceError } from '@ez4/aws-common';

import { RoleServiceType, RoleState } from './types.js';

export const getRoleArn = <E extends EntryState>(
  serviceName: string,
  resourceId: string,
  context: StepContext<E | RoleState>
) => {
  const resource = context.getDependencies(RoleServiceType).at(0)?.result;

  if (!resource?.roleArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'roleArn');
  }

  return resource.roleArn;
};
