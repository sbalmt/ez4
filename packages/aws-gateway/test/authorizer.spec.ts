import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';
import { join } from 'node:path';

import {
  createGateway,
  createAuthorizer,
  createAuthorizerFunction,
  isAuthorizer
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
  ok(isAuthorizer(resource));

  const { apiId, authorizerId, functionArn } = resource.result;

  ok(apiId);
  ok(authorizerId);
  ok(functionArn);

  return {
    result: resource.result,
    state
  };
};

describe.only('gateway authorizer', () => {
  const baseDir = join(import.meta.dirname, '../test/files');

  let lastState: EntryStates | undefined;
  let authorizerId: string | undefined;

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const gatewayResource = createGateway(localState, {
      gatewayId: 'ez4-test-gateway',
      gatewayName: 'EZ4: Test gateway for authorizers'
    });

    const roleResource = createRole(localState, [], {
      roleName: 'EZ4: Test lambda authorizer role',
      roleDocument: getRoleDocument()
    });

    const lambdaResource = await createAuthorizerFunction(localState, roleResource, {
      sourceFile: join(baseDir, 'lambda.js'),
      functionName: 'EZ4: Test authorizer lambda',
      handlerName: 'main'
    });

    const resource = createAuthorizer(localState, gatewayResource, lambdaResource, {
      name: 'EZ4: Test authorizer',
      cacheTTL: 300
    });

    authorizerId = resource.entryId;

    const { state } = await assertDeploy(authorizerId, localState, undefined);

    lastState = state;
  });

  it('assert :: update authorizer', async () => {
    ok(authorizerId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[authorizerId];

    ok(resource && isAuthorizer(resource));

    resource.parameters.cacheTTL = undefined;

    const { state } = await assertDeploy(authorizerId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(authorizerId && lastState);

    ok(lastState[authorizerId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[authorizerId], undefined);
  });
});
