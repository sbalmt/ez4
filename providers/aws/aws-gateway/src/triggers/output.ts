import type { ResourceOutputEvent } from '@ez4/project/library';

import { isGatewayState } from '../gateway/utils';
import { GatewayProtocol } from '../gateway/types';
import { Defaults } from './defaults';

export const resourceOutput = (event: ResourceOutputEvent) => {
  const { serviceState } = event;

  if (!isGatewayState(serviceState)) {
    return null;
  }

  const { parameters, result } = serviceState;

  if (!result) {
    return null;
  }

  const { gatewayName, protocol } = parameters;
  const { endpoint } = result;

  if (protocol === GatewayProtocol.WebSocket) {
    return {
      value: `${endpoint}/${Defaults.StageName}`,
      label: gatewayName
    };
  }

  return {
    label: gatewayName,
    value: endpoint
  };
};
