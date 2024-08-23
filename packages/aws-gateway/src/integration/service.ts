import type { EntryState, EntryStates, StepContext } from '@ez4/stateful';
import type { FunctionState, Permission } from '@ez4/aws-function';
import type { GatewayState } from '../gateway/types.js';
import type { IntegrationParameters, IntegrationState } from './types.js';

import { getRegion, getAccountId } from '@ez4/aws-identity';
import { getPermission, createPermission } from '@ez4/aws-function';
import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { getGatewayId } from '../gateway/utils.js';
import { IntegrationServiceName, IntegrationServiceType } from './types.js';

export const isIntegration = (resource: EntryState): resource is IntegrationState => {
  return resource.type === IntegrationServiceType;
};

export const createIntegration = <E extends EntryState>(
  state: EntryStates<E>,
  gatewayState: GatewayState,
  functionState: FunctionState,
  parameters: IntegrationParameters
) => {
  const integrationId = hashData(
    IntegrationServiceType,
    gatewayState.entryId,
    functionState.entryId
  );

  const permissionState =
    getPermission(state, gatewayState, functionState) ??
    createPermission(state, gatewayState, functionState, {
      getPermission: async (context: StepContext): Promise<Permission> => {
        const [region, account, apiId] = await Promise.all([
          getRegion(),
          getAccountId(),
          getGatewayId(IntegrationServiceName, 'apiId', context)
        ]);

        return {
          principal: 'apigateway.amazonaws.com',
          sourceArn: `arn:aws:execute-api:${region}:${account}:${apiId}/*`
        };
      }
    });

  return attachEntry<E | IntegrationState, IntegrationState>(state, {
    type: IntegrationServiceType,
    entryId: integrationId,
    dependencies: [gatewayState.entryId, functionState.entryId, permissionState.entryId],
    parameters
  });
};

export const getIntegration = <E extends EntryState>(
  state: EntryStates<E>,
  gatewayState: GatewayState,
  functionState: FunctionState
) => {
  const integrationId = hashData(
    IntegrationServiceType,
    gatewayState.entryId,
    functionState.entryId
  );

  const integrationState = state[integrationId];

  if (integrationState && isIntegration(integrationState)) {
    return integrationState;
  }

  return null;
};
