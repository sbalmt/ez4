import { deepEqual, equal, rejects } from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { createModule, registerProvider, unregisterProvider } from '@ez4/emulator';
import { Bucket, BucketEventType } from '@ez4/storage';

import { ProviderEvent } from '../src/types/events';

const TEST_PROVIDER = 'local-test-provider';
const TEST_IDENTIFIER = 'local-test-bucket';
const TEST_DIRECTORY = 'test/bucket';

const createTestModule = <T>(handlerName: string) => {
  return createModule<T>({
    environment: {
      timeout: 3,
      memory: 32
    },
    handler: {
      file: 'test/files/handlers.ts',
      name: handlerName,
      position: [1, 1]
    },
    invoker: {
      provider: TEST_PROVIDER,
      module: '@ez4/local-storage/worker',
      name: 'makeInvoker'
    },
    services: {
      Storage: {
        provider: TEST_PROVIDER,
        module: '@ez4/local-storage/worker',
        name: 'makeService',
        options: {
          host: 'storage.test',
          identifier: TEST_IDENTIFIER,
          directory: TEST_DIRECTORY
        }
      }
    },
    references: {
      storage: 'Storage'
    }
  });
};

describe('worker storage tests', () => {
  let lastProviderEvent: Bucket.Incoming | undefined;

  before(() => {
    registerProvider(TEST_PROVIDER, {
      eventTypes: [ProviderEvent.CreateFile, ProviderEvent.DeleteFile],
      eventHandler: (_event: string, payload: Bucket.Incoming | undefined) => {
        lastProviderEvent = payload;
      }
    });
  });

  beforeEach(() => {
    lastProviderEvent = undefined;
  });

  after(() => {
    unregisterProvider(TEST_PROVIDER);
  });

  it('assert :: key stat (not found)', async () => {
    const module = createTestModule('statNotFound');

    const result = await module.invoke({});

    equal(result, undefined);
  });

  it('assert :: key stat (from keys)', async () => {
    const module = createTestModule('fileStat');

    const result = await module.invoke({});

    deepEqual(result, {
      type: 'application/octet-stream',
      size: 35
    });
  });

  it('assert :: key exists (not found)', async () => {
    const module = createTestModule('existsNotFound');

    const result = await module.invoke({});

    equal(result, false);
  });

  it('assert :: key exists (from keys)', async () => {
    const module = createTestModule('fileExists');

    const result = await module.invoke({});

    equal(result, true);
  });

  it('assert :: write key (create key)', async () => {
    const module = createTestModule<{ file: string; content: string }>('createFile');

    const result = await module.invoke({});

    const contents = await readFile(join(TEST_DIRECTORY, result.file));

    equal(contents.toString(), result.content);

    deepEqual(lastProviderEvent, {
      bucketName: TEST_IDENTIFIER,
      eventType: BucketEventType.Create,
      objectSize: result.content.length,
      objectKey: result.file
    });
  });

  it('assert :: write key (update key)', async () => {
    const module = createTestModule<{ file: string; content: string }>('updateFile');

    const result = await module.invoke({});

    const contents = await readFile(join(TEST_DIRECTORY, result.file));

    equal(contents.toString(), result.content);

    deepEqual(lastProviderEvent, {
      bucketName: TEST_IDENTIFIER,
      eventType: BucketEventType.Create,
      objectSize: result.content.length,
      objectKey: result.file
    });
  });

  it('assert :: read key (not found)', async () => {
    const module = createTestModule('readNotFound');

    await rejects(() => module.invoke({}));
  });

  it('assert :: read key (from keys)', async () => {
    const module = createTestModule<{ file: string; content: string }>('readFile');

    const result = await module.invoke({});

    const contents = await readFile(join(TEST_DIRECTORY, result.file));

    equal(contents.toString(), result.content);
  });

  it('assert :: delete key (not found)', async () => {
    const module = createTestModule('deleteNotFound');

    await rejects(() => module.invoke({}));
  });

  it('assert :: delete key (from keys)', async () => {
    const module = createTestModule<{ file: string }>('deleteFile');

    const result = await module.invoke({});

    equal(existsSync(result.file), false);

    deepEqual(lastProviderEvent, {
      bucketName: TEST_IDENTIFIER,
      eventType: BucketEventType.Delete,
      objectKey: result.file
    });
  });

  it('assert :: copy key (not found)', async () => {
    const module = createTestModule('copyNotFound');

    await rejects(() => module.invoke({}));
  });

  it('assert :: copy key (from keys)', async () => {
    const module = createTestModule<{ file: string }>('copyFile');

    const result = await module.invoke({});

    const filePath = join(TEST_DIRECTORY, result.file);

    equal(existsSync(filePath), true);

    const contents = await readFile(filePath);

    deepEqual(lastProviderEvent, {
      bucketName: TEST_IDENTIFIER,
      eventType: BucketEventType.Create,
      objectSize: contents.toString().length,
      objectKey: result.file
    });
  });

  it('assert :: scan (empty)', async () => {
    const module = createTestModule<{ files: string[] }>('scanEmpty');

    const result = await module.invoke({});

    deepEqual(result, {
      files: ['.test-write.txt', 'dummy.txt', 'folder/dummy.txt']
    });
  });

  it('assert :: scan (from keys prefix)', async () => {
    const module = createTestModule<{ files: string[] }>('scanPrefix');

    const result = await module.invoke({});

    deepEqual(result, {
      files: ['folder/dummy.txt']
    });
  });

  it('assert :: get read url', async () => {
    const module = createTestModule<{ files: string[] }>('readUrl');

    const result = await module.invoke({});

    equal(result, 'http://storage.test/local-test-bucket/foo');
  });

  it('assert :: get write url', async () => {
    const module = createTestModule<{ files: string[] }>('writeUrl');

    const result = await module.invoke({});

    equal(result, 'http://storage.test/local-test-bucket/bar');
  });

  it('assert :: get stats url', async () => {
    const module = createTestModule<{ files: string[] }>('statUrl');

    const result = await module.invoke({});

    equal(result, 'http://storage.test/local-test-bucket/baz');
  });
});
