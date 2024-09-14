import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';
import { join } from 'node:path';

import { deepClone } from '@ez4/utils';
import { isMapping } from '@ez4/aws-function';
import { createQueueFunction, createMapping, createQueue, registerTriggers } from '@ez4/aws-queue';
import { createPolicy, createRole } from '@ez4/aws-identity';
import { deploy } from '@ez4/aws-common';

import { getRoleDocument } from './common/role.js';
import { getPolicyDocument } from './common/policy.js';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isMapping(resource));

  const { eventId, sourceArn } = resource.result;

  ok(eventId);
  ok(sourceArn);

  return {
    result: resource.result,
    state
  };
};

describe.only('queue mapping', () => {
  const baseDir = join(import.meta.dirname, '../test/files');

  let lastState: EntryStates | undefined;
  let mappingId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const queueResource = createQueue(localState, {
      queueName: 'ez4-test-queue-mapping'
    });

    const policyResource = createPolicy(localState, {
      policyName: 'EZ4: Test queue mapping policy',
      policyDocument: getPolicyDocument()
    });

    const roleResource = createRole(localState, [policyResource], {
      roleName: 'EZ4: Test queue mapping role',
      roleDocument: getRoleDocument()
    });

    const functionResource = await createQueueFunction(localState, roleResource, {
      sourceFile: join(baseDir, 'lambda.js'),
      functionName: 'EZ4: Test queue mapping lambda',
      handlerName: 'main'
    });

    const resource = createMapping(localState, queueResource, functionResource, {
      enabled: true,
      batch: {
        batchSize: 100,
        maxWindow: 5
      }
    });

    mappingId = resource.entryId;

    const { state } = await assertDeploy(mappingId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(mappingId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[mappingId];

    ok(resource && isMapping(resource));
    ok(resource.parameters.batch);

    resource.parameters.batch.batchSize = 10;
    resource.parameters.enabled = false;

    const { state } = await assertDeploy(mappingId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(mappingId && lastState);

    ok(lastState[mappingId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[mappingId], undefined);
  });
});
