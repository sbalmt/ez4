import type { EntryState, EntryStates, StepContext } from '@ez4/stateful';
import type { FunctionState, Permission } from '@ez4/aws-function';
import type { GatewayState } from '../gateway/types.js';
import type { AuthorizerParameters, AuthorizerState } from './types.js';

import { getRegion, getAccountId } from '@ez4/aws-identity';
import { getPermission, createPermission } from '@ez4/aws-function';
import { hashData, toKebabCase } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { getGatewayId } from '../gateway/utils.js';
import { AuthorizerServiceName, AuthorizerServiceType } from './types.js';

export const isAuthorizer = (resource: EntryState): resource is AuthorizerState => {
  return resource.type === AuthorizerServiceType;
};

export const createAuthorizer = <E extends EntryState>(
  state: EntryStates<E>,
  gatewayState: GatewayState,
  functionState: FunctionState,
  parameters: AuthorizerParameters
) => {
  const authorizerId = hashData(AuthorizerServiceType, gatewayState.entryId, functionState.entryId);

  const permissionState =
    getPermission(state, gatewayState, functionState) ??
    createPermission(state, gatewayState, functionState, {
      getPermission: async (context: StepContext): Promise<Permission> => {
        const [region, account, apiId] = await Promise.all([
          getRegion(),
          getAccountId(),
          getGatewayId(AuthorizerServiceName, 'apiId', context)
        ]);

        return {
          principal: 'apigateway.amazonaws.com',
          sourceArn: `arn:aws:execute-api:${region}:${account}:${apiId}/*`
        };
      }
    });

  return attachEntry<E | AuthorizerState, AuthorizerState>(state, {
    type: AuthorizerServiceType,
    entryId: authorizerId,
    dependencies: [gatewayState.entryId, functionState.entryId, permissionState.entryId],
    parameters: {
      ...parameters,
      name: toKebabCase(parameters.name)
    }
  });
};

export const getAuthorizer = <E extends EntryState>(
  state: EntryStates<E>,
  gatewayState: GatewayState,
  functionState: FunctionState
) => {
  const authorizerId = hashData(AuthorizerServiceType, gatewayState.entryId, functionState.entryId);
  const authorizerState = state[authorizerId];

  if (authorizerState && isAuthorizer(authorizerState)) {
    return authorizerState;
  }

  return null;
};
