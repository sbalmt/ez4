import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';
import { join } from 'node:path';

import {
  createGateway,
  createIntegration,
  createIntegrationFunction,
  isIntegrationState,
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
  ok(isIntegrationState(resource));

  const { apiId, integrationId, functionArn } = resource.result;

  ok(apiId);
  ok(integrationId);
  ok(functionArn);

  return {
    result: resource.result,
    state
  };
};

describe.only('gateway integration', () => {
  const baseDir = join(import.meta.dirname, '../test/files');

  let lastState: EntryStates | undefined;
  let integrationId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const gatewayResource = createGateway(localState, {
      gatewayId: 'ez4-test-gateway',
      gatewayName: 'EZ4: Test gateway for integrations'
    });

    const roleResource = createRole(localState, [], {
      roleName: 'EZ4: Test lambda integration role',
      roleDocument: getRoleDocument()
    });

    const lambdaResource = await createIntegrationFunction(localState, roleResource, {
      sourceFile: join(baseDir, 'lambda.js'),
      functionName: 'EZ4: Test integration lambda',
      handlerName: 'main'
    });

    const resource = createIntegration(localState, gatewayResource, lambdaResource, {
      description: 'EZ4: Test integration'
    });

    integrationId = resource.entryId;

    const { state } = await assertDeploy(integrationId, localState, undefined);

    lastState = state;
  });

  it('assert :: update integration', async () => {
    ok(integrationId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[integrationId];

    ok(resource && isIntegrationState(resource));

    resource.parameters.description = 'EZ4: New integration description';

    const { state } = await assertDeploy(integrationId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(integrationId && lastState);

    ok(lastState[integrationId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[integrationId], undefined);
  });
});
