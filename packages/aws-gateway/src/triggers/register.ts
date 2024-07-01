import type { DeployOptions, ServiceResourceEvent } from '@ez4/project';
import type { HttpService } from '@ez4/gateway/library';
import type { RoleState } from '@ez4/aws-identity';
import type { EntryStates } from '@ez4/stateful';
import type { GatewayState } from '../gateway/types.js';

import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { isRole, registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerGatewayTriggers } from '@ez4/gateway/library';

import { createTrigger } from '@ez4/project';
import { isHttpService } from '@ez4/gateway/library';
import { getFunction } from '@ez4/aws-function';

import { createFunction } from '../function/service.js';
import { createGateway } from '../gateway/service.js';
import { createStage } from '../stage/service.js';
import { getIntegration, createIntegration } from '../integration/service.js';
import { createRoute } from '../route/service.js';

let isRegistered = false;

/**
 * Register all triggers.
 */
export const registerTriggers = () => {
  if (!isRegistered) {
    registerAwsTriggers();
    registerAwsIdentityTriggers();
    registerAwsFunctionTriggers();
    registerGatewayTriggers();

    createTrigger('@ez4/aws-gateway', {
      'deploy:prepareResources': prepareHttpServices
    });

    isRegistered = true;
  }

  return isRegistered;
};

const prepareHttpServices = async (event: ServiceResourceEvent) => {
  const { state, service, options, role } = event;

  if (!isHttpService(service) || !isRole(role)) {
    return;
  }

  const gatewayState = createGateway(state, {
    gatewayId: service.id,
    gatewayName: service.name,
    description: service.description
  });

  createStage(state, gatewayState, {
    autoDeploy: true
  });

  await createHttpRoutes(state, service, role, gatewayState, options);
};

const createHttpRoutes = async (
  state: EntryStates,
  service: HttpService,
  executionRole: RoleState,
  gatewayState: GatewayState,
  options: DeployOptions
) => {
  const serviceName = `${options.resourcePrefix}-${service.id}`;

  for (const route of service.routes) {
    const handler = route.handler;
    const request = handler.request;

    const functionName = `${serviceName}-${handler.name}`;

    const functionState =
      getFunction(state, executionRole, functionName) ??
      (await createFunction(state, executionRole, {
        functionName,
        description: handler.description,
        sourceFile: handler.file,
        handlerName: handler.name,
        querySchema: request.query,
        parametersSchema: request.parameters,
        bodySchema: request.body,
        extras: service.extras,
        variables: {
          ...service.variables,
          ...route.variables
        }
      }));

    const integrationState =
      getIntegration(state, gatewayState, functionState) ??
      createIntegration(state, gatewayState, functionState, {
        description: handler.description
      });

    createRoute(state, gatewayState, integrationState, {
      routePath: route.path
    });
  }
};
