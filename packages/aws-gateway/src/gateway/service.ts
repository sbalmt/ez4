import type { EntryState, EntryStates } from '@ez4/stateful';
import type { GatewayParameters, GatewayState } from './types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { GatewayServiceType } from './types.js';

export const isGateway = (resource: EntryState): resource is GatewayState => {
  return resource.type === GatewayServiceType;
};

export const createGateway = <E extends EntryState>(
  state: EntryStates<E>,
  parameters: GatewayParameters
) => {
  const gatewayId = toKebabCase(parameters.gatewayId);
  const entryId = hashData(GatewayServiceType, gatewayId);

  return attachEntry<E | GatewayState, GatewayState>(state, {
    type: GatewayServiceType,
    entryId,
    dependencies: [],
    parameters: {
      ...parameters,
      gatewayId
    }
  });
};

export const getGateway = <E extends EntryState>(state: EntryStates<E>, queueName: string) => {
  const queueId = hashData(toKebabCase(queueName));
  const queueState = state[queueId];

  if (queueState && isGateway(queueState)) {
    return queueState;
  }

  return null;
};
