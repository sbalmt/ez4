import type { ConnectResourceEvent, DeployOptions, EventContext, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';
import type { EntryStates } from '@ez4/stateful';
import type { GatewayState } from '../../gateway/types';

import { getServiceName, isLinkedContextVpcRequired, linkServiceContext } from '@ez4/project/library';
import { createLogGroup, createLogPolicy } from '@ez4/aws-logs';
import { getFunctionState } from '@ez4/aws-function';
import { isHttpService } from '@ez4/gateway/library';
import { isRoleState } from '@ez4/aws-identity';

import { createStage } from '../../stage/service';
import { createRoute } from '../../route/service';
import { createGateway } from '../../gateway/service';
import { GatewayProtocol } from '../../gateway/types';
import { getIntegrationRequestFunction } from '../integration';
import { getAuthorizerFunction } from '../authorizer';
import { getInternalName } from '../utils/name';
import { RoleMissingError } from '../errors';
import { prepareLinkedClient } from './client';
import { getCorsConfiguration } from './cors';

export const prepareHttpLinkedService = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (isHttpService(service)) {
    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareHttpServices = (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (isHttpService(service)) {
    const { name, displayName, description, routes, cors } = service;

    const gatewayState = createGateway(state, {
      cors: cors && getCorsConfiguration(routes, cors),
      gatewayId: getServiceName(service, options),
      gatewayName: displayName ?? name,
      protocol: GatewayProtocol.Http,
      tags: options.tags,
      description
    });

    const logGroupState = createAccessLog(state, service, gatewayState, options);

    createStage(state, gatewayState, logGroupState, {
      autoDeploy: true
    });

    createRoutes(state, service, gatewayState, options, context);

    context.setServiceState(service, options, gatewayState);

    return true;
  }

  return false;
};

export const connectHttpServices = (event: ConnectResourceEvent) => {
  const { state, service, options, context } = event;

  if (isHttpService(service)) {
    if (!context.role || !isRoleState(context.role)) {
      throw new RoleMissingError();
    }

    for (const { disabled, authorizer, handler } of service.routes) {
      if (disabled) {
        continue;
      }

      const handlerName = getInternalName(service, handler.name);
      const handlerState = getFunctionState(context, handlerName, options);

      linkServiceContext(state, handlerState.entryId, service.context);

      if (!handlerState.parameters.useVpc && handler.isolated) {
        handlerState.parameters.useVpc = isLinkedContextVpcRequired(service.context, handler.provider?.services);
      }

      if (authorizer) {
        const authorizerName = getInternalName(service, authorizer.name);
        const authorizerState = getFunctionState(context, authorizerName, options);

        linkServiceContext(state, authorizerState.entryId, service.context);

        if (!authorizerState.parameters.useVpc && authorizer.isolated) {
          authorizerState.parameters.useVpc = isLinkedContextVpcRequired(service.context, authorizer.provider?.services);
        }
      }
    }
  }
};

const createAccessLog = (state: EntryStates, service: HttpService, gatewayState: GatewayState, options: DeployOptions) => {
  const { access } = service;
  const { tags } = options;

  if (!access?.logRetention) {
    return undefined;
  }

  const logGroupState = createLogGroup(state, {
    groupName: getServiceName(service, options),
    retention: access.logRetention,
    tags
  });

  createLogPolicy(state, logGroupState, gatewayState, {
    fromService: getServiceName(service, options),
    policyGetter: () => {
      return {
        service: 'apigateway.amazonaws.com'
      };
    }
  });

  return logGroupState;
};

const createRoutes = (
  state: EntryStates,
  service: HttpService,
  gatewayState: GatewayState,
  options: DeployOptions,
  context: EventContext
) => {
  for (const route of service.routes) {
    if (route.disabled) {
      continue;
    }

    const integrationState = getIntegrationRequestFunction(state, service, gatewayState, route, options, context);
    const authorizerState = getAuthorizerFunction(state, service, gatewayState, route, options, context);

    createRoute(state, gatewayState, integrationState, authorizerState, {
      routePath: route.path
    });
  }
};
