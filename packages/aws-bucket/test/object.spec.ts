import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';
import { join } from 'node:path';

import { deepClone } from '@ez4/utils';
import { createBucket, createBucketObject, isBucketObject } from '@ez4/aws-bucket';
import { deploy } from '@ez4/aws-common';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isBucketObject(resource));

  const { bucketName, objectKey, etag } = resource.result;

  ok(bucketName);
  ok(objectKey);
  ok(etag);

  return {
    result: resource.result,
    state
  };
};

describe.only('bucket object resources', () => {
  let lastState: EntryStates | undefined;
  let objectId: string | undefined;

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const bucketResource = createBucket(localState, {
      bucketName: 'EZ4 Test Bucket For Objects'
    });

    const resource = createBucketObject(localState, bucketResource, {
      filePath: join(import.meta.dirname, '../test/files/object-file.txt'),
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    objectId = resource.entryId;

    const { state } = await assertDeploy(objectId, localState, undefined);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(objectId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[objectId];

    ok(resource && isBucketObject(resource));

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
