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
  registerTriggers
} from '@ez4/aws-gateway';

import { createRole } from '@ez4/aws-identity';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

import { getRoleDocument } from './common/role.js';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
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

describe.only('gateway route', () => {
  const baseDir = 'test/files';

  let lastState: EntryStates | undefined;
  let routeId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const gatewayResource = createGateway(localState, {
      gatewayId: 'ez4-test-gateway',
      gatewayName: 'EZ4: Test gateway for routes'
    });

    const roleResource = createRole(localState, [], {
      roleName: 'EZ4: Test lambda route role',
      roleDocument: getRoleDocument()
    });

    const integrationLambdaResource = await createIntegrationFunction(localState, roleResource, {
      functionName: 'EZ4: Test integration handler lambda',
      handler: {
        functionName: 'main',
        sourceFile: join(baseDir, 'lambda.js')
      }
    });

    const integrationResource = createIntegration(
      localState,
      gatewayResource,
      integrationLambdaResource,
      {
        description: 'EZ4: Test route integration'
      }
    );

    const authorizerLambdaResource = await createAuthorizerFunction(localState, roleResource, {
      functionName: 'EZ4: Test route authorizer lambda',
      authorizer: {
        functionName: 'main',
        sourceFile: join(baseDir, 'lambda.js')
      }
    });

    const authorizerResource = createAuthorizer(
      localState,
      gatewayResource,
      authorizerLambdaResource,
      {
        name: 'EZ4: Test route authorizer'
      }
    );

    const resource = createRoute(
      localState,
      gatewayResource,
      integrationResource,
      authorizerResource,
      {
        routePath: 'GET /ez4-test',
        operationName: 'EZ4: Test route operation name'
      }
    );

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
    resource.parameters.operationName = 'EZ4: New route operation Name';

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
