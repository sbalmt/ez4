import type { EntryState, StepContext } from '@ez4/stateful';
import type { GatewayState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';
import { hashData, toKebabCase } from '@ez4/utils';

import { GatewayServiceType } from './types.js';

export const isGatewayState = (resource: EntryState): resource is GatewayState => {
  return resource.type === GatewayServiceType;
};

export const getGatewayStateId = (gatewayId: string) => {
  return hashData(GatewayServiceType, toKebabCase(gatewayId));
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
