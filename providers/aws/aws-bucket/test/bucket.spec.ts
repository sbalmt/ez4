import type { EntryState, EntryStates } from '@ez4/stateful';

import { ok, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { join } from 'node:path';

import { createBucket, createBucketEventFunction, isBucketState, registerTriggers } from '@ez4/aws-bucket';

import { deploy } from '@ez4/aws-common';
import { createLogGroup } from '@ez4/aws-logs';
import { createRole } from '@ez4/aws-identity';
import { deepClone } from '@ez4/utils';

import { getRoleDocument } from './common/role';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isBucketState(resource));

  const result = resource.result;

  ok(result.bucketName);

  return {
    result,
    state
  };
};

describe('bucket resources', () => {
  const baseDir = 'test/files';

  let lastState: EntryStates | undefined;
  let bucketId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const roleResource = createRole(localState, [], {
      roleName: 'ez4-test-bucket-event-role',
      roleDocument: getRoleDocument()
    });

    const logGroupResource = createLogGroup(localState, {
      groupName: 'ez4-test-bucket-event-logs',
      retention: 1
    });

    const lambdaResource = createBucketEventFunction(localState, roleResource, logGroupResource, {
      functionName: 'ez4-test-bucket-event-lambda',
      variables: [],
      handler: {
        sourceFile: join(baseDir, 'lambda.js'),
        functionName: 'main',
        dependencies: []
      }
    });

    const resource = createBucket(localState, lambdaResource, {
      bucketName: 'ez4-test-bucket',
      eventsPath: 'uploads/',
      autoExpireDays: 5,
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      },
      cors: {
        allowHeaders: ['content-type'],
        allowOrigins: ['http://localhost'],
        allowMethods: ['PUT']
      }
    });

    bucketId = resource.entryId;

    const { state } = await assertDeploy(bucketId, localState, undefined);

    lastState = state;
  });

  it('assert :: update cors', async () => {
    ok(bucketId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[bucketId];

    ok(resource && isBucketState(resource));

    resource.parameters.cors = undefined;

    const { state } = await assertDeploy(bucketId, localState, lastState);

    lastState = state;
  });

  it('assert :: update lifecycle', async () => {
    ok(bucketId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[bucketId];

    ok(resource && isBucketState(resource));

    resource.parameters.autoExpireDays = undefined;

    const { state } = await assertDeploy(bucketId, localState, lastState);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(bucketId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[bucketId];

    ok(resource && isBucketState(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

    const { state } = await assertDeploy(bucketId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(bucketId && lastState);

    ok(lastState[bucketId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[bucketId], undefined);
  });
});
