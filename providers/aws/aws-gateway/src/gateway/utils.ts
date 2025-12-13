import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { GatewayState } from './types';

import { IncompleteResourceError } from '@ez4/aws-common';
import { hashData, toKebabCase } from '@ez4/utils';

import { GatewayNotFoundError } from './errors';
import { GatewayServiceType } from './types';

export const createGatewayStateId = (gatewayId: string) => {
  return hashData(GatewayServiceType, toKebabCase(gatewayId));
};

export const isGatewayState = (resource: EntryState): resource is GatewayState => {
  return resource.type === GatewayServiceType;
};

export const getGatewayState = (context: EventContext, gatewayName: string, options: DeployOptions) => {
  const gatewayState = context.getServiceState(gatewayName, options);

  if (!isGatewayState(gatewayState)) {
    throw new GatewayNotFoundError(gatewayName);
  }

  return gatewayState;
};

export const getGatewayId = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<GatewayState>(GatewayServiceType).at(0)?.result;

  if (!resource?.apiId) {
    throw new IncompleteResourceError(serviceName, resourceId, 'apiId');
  }

  return resource.apiId;
};

export const getGatewayArn = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<GatewayState>(GatewayServiceType).at(0)?.result;

  if (!resource?.apiArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'apiArn');
  }

  return resource.apiArn;
};

export const getGatewayProtocol = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<GatewayState>(GatewayServiceType).at(0)?.parameters;

  if (!resource?.protocol) {
    throw new IncompleteResourceError(serviceName, resourceId, 'protocol');
  }

  return resource.protocol;
};
