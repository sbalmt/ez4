import type { ResourceOutputEvent } from '@ez4/project/library';
import type { StageState } from '../stage/types';

import { getEntryDependents } from '@ez4/stateful';

import { isGatewayState } from '../gateway/utils';
import { GatewayProtocol } from '../gateway/types';
import { StageServiceType } from '../stage/types';
import { Defaults } from '../utils/defaults';

export const resourceOutput = (event: ResourceOutputEvent) => {
  const { state, service } = event;

  if (!isGatewayState(service)) {
    return null;
  }

  const { parameters, result } = service;

  if (!result) {
    return null;
  }

  const { gatewayName, protocol } = parameters;
  const { endpoint } = result;

  if (protocol === GatewayProtocol.WebSocket) {
    const [stageState] = getEntryDependents<StageState>(state, service, StageServiceType);

    if (stageState) {
      const stageName = stageState.parameters.stageName ?? Defaults.StageName;

      return {
        value: `${endpoint}/${stageName}`,
        label: gatewayName
      };
    }
  }

  return {
    label: gatewayName,
    value: endpoint
  };
};
