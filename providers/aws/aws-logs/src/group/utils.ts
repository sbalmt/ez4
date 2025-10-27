import type { EntryState, StepContext } from '@ez4/stateful';
import type { LogGroupState } from './types';

import { IncompleteResourceError } from '@ez4/aws-common';

import { LogGroupServiceType } from './types';

export const isLogGroupState = (resource: EntryState): resource is LogGroupState => {
  return resource.type === LogGroupServiceType;
};

export const getLogGroupName = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<LogGroupState>(LogGroupServiceType).at(0)?.parameters;

  if (!resource?.groupName) {
    throw new IncompleteResourceError(serviceName, resourceId, 'logGroupName');
  }

  return resource.groupName;
};

export const tryGetLogGroupArn = (context: StepContext) => {
  const resources = context.getDependencies<LogGroupState>(LogGroupServiceType);

  return resources.at(0)?.result?.groupArn;
};

export const getLogGroupArn = (serviceName: string, resourceId: string, context: StepContext) => {
  const groupArn = tryGetLogGroupArn(context);

  if (!groupArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'groupArn');
  }

  return groupArn;
};
