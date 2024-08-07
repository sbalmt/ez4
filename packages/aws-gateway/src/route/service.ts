import type { EntryState, EntryStates } from '@ez4/stateful';
import type { IntegrationState } from '../integration/types.js';
import type { GatewayState } from '../gateway/types.js';
import type { RouteParameters, RouteState } from './types.js';

import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { RouteServiceType } from './types.js';

export const isRoute = (resource: EntryState): resource is RouteState => {
  return resource.type === RouteServiceType;
};

export const createRoute = <E extends EntryState>(
  state: EntryStates<E>,
  gatewayState: GatewayState,
  integrationState: IntegrationState,
  parameters: RouteParameters
) => {
  const routeId = hashData(RouteServiceType, gatewayState.entryId, integrationState.entryId);

  return attachEntry<E | RouteState, RouteState>(state, {
    type: RouteServiceType,
    entryId: routeId,
    dependencies: [gatewayState.entryId, integrationState.entryId],
    parameters
  });
};
