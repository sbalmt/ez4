import type { EntryState, EntryStates, StepContext } from '@ez4/stateful';
import type { FunctionState } from '@ez4/aws-function';
import type { GatewayState } from '../gateway/types';
import type { AuthorizerParameters, AuthorizerState } from './types';

import { getRegion, getAccountId } from '@ez4/aws-identity';
import { getPermission, createPermission } from '@ez4/aws-function';
import { hashData, toKebabCase } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { getGatewayId } from '../gateway/utils';
import { AuthorizerServiceName, AuthorizerServiceType } from './types';
import { isAuthorizerState } from './utils';

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
      fromService: parameters.name,
      getPermission: async (context: StepContext) => {
        const [region, account, apiId] = await Promise.all([
          getRegion(),
          getAccountId(),
          getGatewayId(AuthorizerServiceName, 'apiId', context)
        ]);

        return {
          sourceArn: `arn:aws:execute-api:${region}:${account}:${apiId}/*`,
          principal: 'apigateway.amazonaws.com'
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

export const getAuthorizer = <E extends EntryState>(state: EntryStates<E>, gatewayState: GatewayState, functionState: FunctionState) => {
  const authorizerId = hashData(AuthorizerServiceType, gatewayState.entryId, functionState.entryId);
  const authorizerState = state[authorizerId];

  if (authorizerState && isAuthorizerState(authorizerState)) {
    return authorizerState;
  }

  return null;
};
