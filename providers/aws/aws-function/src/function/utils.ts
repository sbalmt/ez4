import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { FunctionState } from './types';

import { getDefaultSecurityGroupId, getDefaultSubnetIds, getDefaultVpcId } from '@ez4/aws-vpc';
import { IncompleteResourceError } from '@ez4/aws-common';

import { DefaultVpcDetailsError, FunctionNotFoundError } from './errors';
import { FunctionServiceType } from './types';

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

export const getDefaultVpcConfig = async () => {
  const defaultVpcId = await getDefaultVpcId();

  if (!defaultVpcId) {
    throw new DefaultVpcDetailsError();
  }

  const [subnetIds, securityGroupId] = await Promise.all([getDefaultSubnetIds(defaultVpcId), getDefaultSecurityGroupId(defaultVpcId)]);

  if (!subnetIds?.length || !securityGroupId) {
    throw new DefaultVpcDetailsError();
  }

  return {
    subnetIds: subnetIds.slice(0, 2),
    securityGroupId
  };
};
