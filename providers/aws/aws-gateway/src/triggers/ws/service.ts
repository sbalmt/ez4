import type { ConnectResourceEvent, DeployOptions, EventContext, PrepareResourceEvent } from '@ez4/project/library';
import type { WsService } from '@ez4/gateway/library';
import type { EntryStates } from '@ez4/stateful';
import type { GatewayState } from '../../gateway/types';

import { isWsService } from '@ez4/gateway/library';
import { getServiceName, linkServiceContext } from '@ez4/project/library';
import { getFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createStage } from '../../stage/service';
import { createRoute } from '../../route/service';
import { createGateway } from '../../gateway/service';
import { GatewayProtocol } from '../../gateway/types';
import { createResponse } from '../../response/service';
import { getIntegrationConnectionFunction, getIntegrationMessageFunction } from '../integration';
import { getAuthorizerFunction } from '../authorizer';
import { RoleMissingError } from '../errors';
import { getInternalName } from '../utils';

export const prepareWsServices = (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (isWsService(service)) {
    const { name, displayName, description } = service;
    const { tags } = options;

    const gatewayState = createGateway(state, {
      protocol: GatewayProtocol.WebSocket,
      gatewayId: getServiceName(service, options),
      gatewayName: displayName ?? name,
      routeKey: 'ez4/unknown',
      description,
      tags
    });

    createStage(state, gatewayState, undefined, {
      stageName: 'stream',
      autoDeploy: true
    });

    createConnectAction(state, service, gatewayState, options, context);
    createDisconnectAction(state, service, gatewayState, options, context);
    createMessageAction(state, service, gatewayState, options, context);

    return true;
  }

  return false;
};

export const connectWsServices = (event: ConnectResourceEvent) => {
  const { state, service, options, context } = event;

  if (isWsService(service)) {
    if (!context.role || !isRoleState(context.role)) {
      throw new RoleMissingError();
    }

    const { connect, disconnect, message } = service;

    for (const { handler } of [connect, disconnect, message]) {
      const handlerName = getInternalName(service, handler.name);
      const handlerState = getFunctionState(context, handlerName, options);

      linkServiceContext(state, handlerState.entryId, service.context);
    }

    if (connect.authorizer) {
      const authorizerName = getInternalName(service, connect.authorizer.name);
      const authorizerState = getFunctionState(context, authorizerName, options);

      linkServiceContext(state, authorizerState.entryId, service.context);
    }
  }
};

const createConnectAction = (
  state: EntryStates,
  service: WsService,
  gatewayState: GatewayState,
  options: DeployOptions,
  context: EventContext
) => {
  const { connect } = service;

  const integrationState = getIntegrationConnectionFunction(state, service, gatewayState, connect, options, context);
  const authorizerState = getAuthorizerFunction(state, service, gatewayState, connect, options, context);

  createRoute(state, gatewayState, integrationState, authorizerState, {
    routePath: '$connect'
  });
};

const createDisconnectAction = (
  state: EntryStates,
  service: WsService,
  gatewayState: GatewayState,
  options: DeployOptions,
  context: EventContext
) => {
  const { disconnect } = service;

  const integrationState = getIntegrationConnectionFunction(state, service, gatewayState, disconnect, options, context);

  createRoute(state, gatewayState, integrationState, undefined, {
    routePath: '$disconnect'
  });
};

const createMessageAction = (
  state: EntryStates,
  service: WsService,
  gatewayState: GatewayState,
  options: DeployOptions,
  context: EventContext
) => {
  const { message } = service;

  const integrationState = getIntegrationMessageFunction(state, service, gatewayState, message, options, context);

  const routeState = createRoute(state, gatewayState, integrationState, undefined, {
    routePath: '$default'
  });

  if (message.handler.response) {
    createResponse(state, gatewayState, routeState, {
      responseKey: '$default'
    });
  }
};
