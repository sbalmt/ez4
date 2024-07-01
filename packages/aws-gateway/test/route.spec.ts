import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';
import { join } from 'node:path';

import {
  createFunction,
  createGateway,
  createIntegration,
  createRoute,
  isRoute
} from '@ez4/aws-gateway';

import { deepClone } from '@ez4/utils';
import { createRole } from '@ez4/aws-identity';
import { deploy } from '@ez4/aws-common';

import { getRoleDocument } from './common/role.js';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isRoute(resource));

  const { apiId, integrationId, routeId, routeArn } = resource.result;

  ok(apiId);
  ok(integrationId);
  ok(routeId);
  ok(routeArn);

  return {
    result: resource.result,
    state
  };
};

describe.only('gateway route', () => {
  const baseDir = join(import.meta.dirname, '../test/files');

  let lastState: EntryStates | undefined;
  let routeId: string | undefined;

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

    const functionResource = await createFunction(localState, roleResource, {
      sourceFile: join(baseDir, 'lambda.js'),
      functionName: 'EZ4: Test route lambda',
      handlerName: 'main'
    });

    const integrationResource = createIntegration(localState, gatewayResource, functionResource, {
      description: 'EZ4: Test route integration'
    });

    const resource = createRoute(localState, gatewayResource, integrationResource, {
      routePath: 'GET /ez4-test',
      operationName: 'EZ4: Test route operation name'
    });

    routeId = resource.entryId;

    const { state } = await assertDeploy(routeId, localState, undefined);

    lastState = state;
  });

  it('assert :: update route', async () => {
    ok(routeId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[routeId];

    ok(resource && isRoute(resource));

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
