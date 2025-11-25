import type { ResourceOutputEvent } from '@ez4/project/library';
import { isGatewayState } from '../main';

export const resourceOutput = (event: ResourceOutputEvent) => {
  const { serviceState } = event;

  if (!isGatewayState(serviceState)) {
    return null;
  }

  return {
    label: serviceState.parameters.gatewayName,
    value: serviceState.result?.endpoint
  };
};
