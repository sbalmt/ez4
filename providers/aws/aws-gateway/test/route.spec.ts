import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';
import { join } from 'node:path';

import {
  createGateway,
  createIntegration,
  createAuthorizer,
  createIntegrationFunction,
  createAuthorizerFunction,
  createRoute,
  isRouteState,
  registerTriggers,
  IntegrationFunctionType,
  GatewayProtocol
} from '@ez4/aws-gateway';

import { ArchitectureType, RuntimeType } from '@ez4/common';
import { createLogGroup } from '@ez4/aws-logs';
import { createRole } from '@ez4/aws-identity';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

import { getRoleDocument } from './common/role';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isRouteState(resource));

  const { apiId, integrationId, authorizerId, routeId, routeArn } = resource.result;

  ok(apiId);
  ok(integrationId);
  ok(authorizerId);
  ok(routeId);
  ok(routeArn);

  return {
    result: resource.result,
    state
  };
};

describe('gateway route', () => {
  const baseDir = 'test/files';

  let lastState: EntryStates | undefined;
  let routeId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const gatewayResource = createGateway(localState, {
      gatewayId: 'ez4-test-gateway-route',
      gatewayName: 'EZ4: Test gateway for routes',
      protocol: GatewayProtocol.Http
    });

    const roleResource = createRole(localState, [], {
      roleName: 'ez4-test-gateway-route-role',
      roleDocument: getRoleDocument()
    });

    const logGroupResource = createLogGroup(localState, {
      groupName: 'ez4-test-gateway-route-logs',
      retention: 1
    });

    const integrationLambdaResource = createIntegrationFunction(localState, roleResource, logGroupResource, {
      functionName: 'ez4-test-gateway-route-integration-lambda',
      type: IntegrationFunctionType.HttpRequest,
      architecture: ArchitectureType.Arm,
      runtime: RuntimeType.Node24,
      variables: [],
      handler: {
        sourceFile: join(baseDir, 'lambda.js'),
        functionName: 'main',
        dependencies: []
      }
    });

    const integrationResource = createIntegration(localState, gatewayResource, integrationLambdaResource, {
      fromService: integrationLambdaResource.parameters.functionName,
      description: 'ez4-test-gateway-route-integration'
    });

    const authorizerLambdaResource = createAuthorizerFunction(localState, roleResource, logGroupResource, {
      functionName: 'ez4-test-gateway-route-authorizer-lambda',
      architecture: ArchitectureType.Arm,
      runtime: RuntimeType.Node24,
      variables: [],
      authorizer: {
        sourceFile: join(baseDir, 'lambda.js'),
        functionName: 'main',
        dependencies: []
      }
    });

    const authorizerResource = createAuthorizer(localState, gatewayResource, authorizerLambdaResource, {
      name: 'ez4-test-gateway-route-authorizer'
    });

    const resource = createRoute(localState, gatewayResource, integrationResource, authorizerResource, {
      operationName: 'ez4-test-gateway-route',
      routePath: 'GET /ez4-test'
    });

    routeId = resource.entryId;

    const { state } = await assertDeploy(routeId, localState, undefined);

    lastState = state;
  });

  it('assert :: update route', async () => {
    ok(routeId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[routeId];

    ok(resource && isRouteState(resource));

    resource.parameters.routePath = 'GET /ez4/new-route';
    resource.parameters.operationName = 'ez4-new-route-operation-name';

    const { state } = await assertDeploy(routeId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(routeId && lastState);

    ok(lastState[routeId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[routeId], undefined);
  });
});
