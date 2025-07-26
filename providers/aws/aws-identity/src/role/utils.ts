import type { EntryState, StepContext } from '@ez4/stateful';
import type { RoleState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';

import { RoleServiceType } from './types.js';

export const isRoleState = (resource: EntryState): resource is RoleState => {
  return resource.type === RoleServiceType;
};

export const getRoleArn = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<RoleState>(RoleServiceType).at(0)?.result;

  if (!resource?.roleArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'roleArn');
  }

  return resource.roleArn;
};
