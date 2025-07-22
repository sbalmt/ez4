import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { FunctionState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';

import { FunctionNotFoundError } from './errors.js';
import { FunctionServiceType } from './types.js';

export const isFunctionState = (resource: EntryState): resource is FunctionState => {
  return resource.type === FunctionServiceType;
};

export const tryGetFunctionState = (context: EventContext, functionName: string, options: DeployOptions) => {
  try {
    const functionState = context.getServiceState(functionName, options);

    if (isFunctionState(functionState)) {
      return functionState;
    }
  } catch {}

  return undefined;
};

export const getFunctionState = (context: EventContext, functionName: string, options: DeployOptions) => {
  const functionState = context.getServiceState(functionName, options);

  if (!isFunctionState(functionState)) {
    throw new FunctionNotFoundError(functionName);
  }

  return functionState;
};

export const getFunctionName = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<FunctionState>(FunctionServiceType).at(0)?.parameters;

  if (!resource?.functionName) {
    throw new IncompleteResourceError(serviceName, resourceId, 'functionName');
  }

  return resource.functionName;
};

export const tryGetFunctionArn = (context: StepContext) => {
  const resource = context.getDependencies<FunctionState>(FunctionServiceType);

  return resource[0]?.result?.functionArn;
};

export const getFunctionArn = (serviceName: string, resourceId: string, context: StepContext) => {
  const functionArn = tryGetFunctionArn(context);

  if (!functionArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'functionArn');
  }

  return functionArn;
};
