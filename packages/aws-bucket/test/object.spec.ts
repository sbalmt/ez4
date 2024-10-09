import type { EntryState, EntryStates } from '@ez4/stateful';

import { ok, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { join } from 'node:path';

import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

import {
  createBucket,
  createBucketObject,
  isBucketObjectState,
  registerTriggers
} from '@ez4/aws-bucket';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isBucketObjectState(resource));

  const result = resource.result;

  ok(result.bucketName);
  ok(result.objectKey);

  return {
    result,
    state
  };
};

describe.only('bucket object resources', () => {
  const baseDir = join(import.meta.dirname, '../test/files');

  let lastState: EntryStates | undefined;
  let objectId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const bucketResource = createBucket(localState, {
      bucketName: 'ez4-test-object-bucket'
    });

    const resource = createBucketObject(localState, bucketResource, {
      filePath: join(baseDir, 'object-file.txt'),
      objectKey: 'object-file.txt',
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    objectId = resource.entryId;

    const { state } = await assertDeploy(objectId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(objectId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[objectId];

    ok(resource && isBucketObjectState(resource));

    resource.parameters.objectKey = 'update-file.txt';

    const { state } = await assertDeploy(objectId, localState, lastState);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(objectId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[objectId];

    ok(resource && isBucketObjectState(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

    const { state } = await assertDeploy(objectId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(objectId && lastState);

    ok(lastState[objectId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[objectId], undefined);
  });
});
