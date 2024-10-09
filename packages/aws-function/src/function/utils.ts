import type { EntryState, StepContext } from '@ez4/stateful';
import type { FunctionState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';

import { FunctionServiceType } from './types.js';

export const isFunctionState = (resource: EntryState): resource is FunctionState => {
  return resource.type === FunctionServiceType;
};

export const getFunctionName = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<FunctionState>(FunctionServiceType).at(0);

  if (!resource?.parameters.functionName) {
    throw new IncompleteResourceError(serviceName, resourceId, 'functionName');
  }

  return resource.parameters.functionName;
};

export const getFunctionArn = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<FunctionState>(FunctionServiceType).at(0)?.result;

  if (!resource?.functionArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'functionArn');
  }

  return resource.functionArn;
};
