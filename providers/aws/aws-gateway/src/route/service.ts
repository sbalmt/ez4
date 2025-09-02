import type { EntryState, EntryStates } from '@ez4/stateful';
import type { IntegrationState } from '../integration/types';
import type { AuthorizerState } from '../authorizer/types';
import type { GatewayState } from '../gateway/types';
import type { RouteParameters, RouteState } from './types';

import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { RouteServiceType } from './types';

export const createRoute = <E extends EntryState>(
  state: EntryStates<E>,
  gatewayState: GatewayState,
  integrationState: IntegrationState,
  authorizerState: AuthorizerState | undefined,
  parameters: RouteParameters
) => {
  const dependencies = [gatewayState.entryId, integrationState.entryId];

  if (authorizerState) {
    dependencies.push(authorizerState.entryId);
  }

  const routeId = hashData(RouteServiceType, gatewayState.entryId, parameters.routePath);

  return attachEntry<E | RouteState, RouteState>(state, {
    type: RouteServiceType,
    entryId: routeId,
    dependencies,
    parameters
  });
};
