import type { EntryState, EntryStates } from '@ez4/stateful';
import type { GatewayState } from '../gateway/types';
import type { RouteState } from '../route/types';
import type { ResponseParameters, ResponseState } from './types';

import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { ResponseServiceType } from './types';

export const createResponse = <E extends EntryState>(
  state: EntryStates<E>,
  gatewayState: GatewayState,
  routeState: RouteState,
  parameters: ResponseParameters
) => {
  const dependencies = [gatewayState.entryId, routeState.entryId];

  const responseId = hashData(ResponseServiceType, gatewayState.entryId, routeState.entryId, parameters.responseKey);

  return attachEntry<E | ResponseState, ResponseState>(state, {
    type: ResponseServiceType,
    entryId: responseId,
    dependencies,
    parameters
  });
};
