import type { EntryStates } from '@ez4/stateful';

import { ok, equal } from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import { describe, it } from 'node:test';
import { join } from 'node:path';

import { createBucket, isBucketState, registerTriggers } from '@ez4/aws-bucket';
import { Client } from '@ez4/aws-bucket/client';
import { deploy } from '@ez4/aws-common';

describe.only('bucket client', () => {
  const baseDir = join(import.meta.dirname, '../test/files');

  let lastState: EntryStates | undefined;
  let bucketId: string | undefined;
  let bucketClient: ReturnType<typeof Client.make>;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createBucket(localState, {
      bucketName: 'ez4-test-bucket-client'
    });

    bucketId = resource.entryId;

    const { result } = await deploy(localState, undefined);

    const resultResource = result[bucketId];

    ok(resultResource && isBucketState(resultResource));
    ok(resultResource.result);

    const { bucketName } = resultResource.result;

    bucketClient = Client.make(bucketName);

    lastState = result;
  });

  it('assert :: put object (stream)', async () => {
    ok(bucketClient);

    const content = createReadStream(join(baseDir, 'object-file.txt'));

    await bucketClient.write('test-client', content);
  });

  it('assert :: put object (plain text)', async () => {
    ok(bucketClient);

    const content = 'Plain text test';

    await bucketClient.write('test-client-plain', content);
  });

  it('assert :: object exists', async () => {
    ok(bucketClient);

    const [objectExists, objectDoNotExists] = await Promise.all([
      bucketClient.exists('test-client'),
      bucketClient.exists('test-client-do-no-exists')
    ]);

    ok(objectExists);

    ok(!objectDoNotExists);
  });

  it('assert :: get object', async () => {
    ok(bucketClient);

    const buffer = await bucketClient.read('test-client-plain');
    const content = buffer.toString();

    equal(content, 'Plain text test');
  });

  it('assert :: delete object', async () => {
    ok(bucketClient);

    await Promise.all([
      bucketClient.delete('test-client'),
      bucketClient.delete('test-client-plain')
    ]);
  });

  it('assert :: destroy', async () => {
    ok(bucketId && lastState);

    ok(lastState[bucketId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[bucketId], undefined);
  });
});
