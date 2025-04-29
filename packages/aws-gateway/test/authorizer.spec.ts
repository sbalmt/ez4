import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';
import { join } from 'node:path';

import { createGateway, createAuthorizer, createAuthorizerFunction, isAuthorizerState, registerTriggers } from '@ez4/aws-gateway';

import { deploy } from '@ez4/aws-common';
import { createLogGroup } from '@ez4/aws-logs';
import { createRole } from '@ez4/aws-identity';
import { deepClone } from '@ez4/utils';

import { getRoleDocument } from './common/role.js';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isAuthorizerState(resource));

  const { apiId, authorizerId, functionArn } = resource.result;

  ok(apiId);
  ok(authorizerId);
  ok(functionArn);

  return {
    result: resource.result,
    state
  };
};

describe('gateway authorizer', () => {
  const baseDir = 'test/files';

  let lastState: EntryStates | undefined;
  let authorizerId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const gatewayResource = createGateway(localState, {
      gatewayId: 'ez4-test-gateway-authorizer',
      gatewayName: 'EZ4: Test gateway for authorizers'
    });

    const roleResource = createRole(localState, [], {
      roleName: 'ez4-test-gateway-authorizer-role',
      roleDocument: getRoleDocument()
    });

    const logGroupResource = createLogGroup(localState, {
      groupName: 'ez4-test-gateway-authorizer-logs',
      retention: 1
    });

    const lambdaResource = createAuthorizerFunction(localState, roleResource, logGroupResource, {
      functionName: 'ez4-test-authorizer-lambda',
      authorizer: {
        functionName: 'main',
        sourceFile: join(baseDir, 'lambda.js')
      }
    });

    const resource = createAuthorizer(localState, gatewayResource, lambdaResource, {
      name: 'ez4-test-authorizer',
      cacheTTL: 300
    });

    authorizerId = resource.entryId;

    const { state } = await assertDeploy(authorizerId, localState, undefined);

    lastState = state;
  });

  it('assert :: update authorizer', async () => {
    ok(authorizerId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[authorizerId];

    ok(resource && isAuthorizerState(resource));

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
