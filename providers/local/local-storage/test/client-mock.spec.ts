import { deepEqual, equal, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BucketTester } from '@ez4/local-storage/test';

describe('local storage tests', () => {
  const defaultContent = 'This is a mocked content';

  it('assert :: key exists (not found)', async () => {
    const client = BucketTester.getClientMock('bucket');

    const exists = await client.exists('random-key');

    equal(client.exists.mock.callCount(), 1);
    equal(exists, false);
  });

  it('assert :: key exists (from default)', async () => {
    const client = BucketTester.getClientMock('bucket', {
      default: Buffer.from(defaultContent)
    });

    const exists = await client.exists('random-key');

    equal(client.exists.mock.callCount(), 1);
    equal(exists, true);
  });

  it('assert :: key exists (from key)', async () => {
    const client = BucketTester.getClientMock('bucket', {
      keys: {
        foo: Buffer.from(defaultContent)
      }
    });

    const exists = await client.exists('foo');

    equal(client.exists.mock.callCount(), 1);
    equal(exists, true);
  });

  it('assert :: key stats (not found)', async () => {
    const client = BucketTester.getClientMock('bucket');

    rejects(() => client.getStats('random-key'));

    equal(client.getStats.mock.callCount(), 1);
  });

  it('assert :: key stats (from default)', async () => {
    const client = BucketTester.getClientMock('bucket', {
      default: Buffer.from(defaultContent)
    });

    const stats = await client.getStats('random-key');

    equal(client.getStats.mock.callCount(), 1);

    deepEqual(stats, {
      type: 'application/octet-stream',
      size: 24
    });
  });

  it('assert :: key stats (from key)', async () => {
    const client = BucketTester.getClientMock('bucket', {
      keys: {
        foo: Buffer.from(defaultContent)
      }
    });

    const stats = await client.getStats('foo');

    equal(client.getStats.mock.callCount(), 1);

    deepEqual(stats, {
      type: 'application/octet-stream',
      size: 24
    });
  });

  it('assert :: read key (not found)', async () => {
    const client = BucketTester.getClientMock('bucket');

    rejects(() => client.read('random-key'));

    equal(client.read.mock.callCount(), 1);
  });

  it('assert :: read key (from default)', async () => {
    const client = BucketTester.getClientMock('bucket', {
      default: Buffer.from(defaultContent)
    });

    const content = await client.read('random-key');

    equal(client.read.mock.callCount(), 1);
    equal(content.toString(), defaultContent);
  });

  it('assert :: read key (from key)', async () => {
    const client = BucketTester.getClientMock('bucket', {
      keys: {
        foo: Buffer.from(defaultContent)
      }
    });

    const content = await client.read('foo');

    equal(client.read.mock.callCount(), 1);
    equal(content.toString(), defaultContent);
  });

  it('assert :: delete key (not found)', async () => {
    const client = BucketTester.getClientMock('bucket');

    rejects(() => client.delete('random-key'));

    equal(client.delete.mock.callCount(), 1);
  });

  it('assert :: delete key (from default)', async () => {
    const client = BucketTester.getClientMock('bucket', {
      default: Buffer.from(defaultContent)
    });

    await client.delete('random-key');

    equal(client.delete.mock.callCount(), 1);

    const exists = await client.exists('random-key');
    const result = await client.read('random-key');

    equal(result.toString(), defaultContent);
    equal(exists, true);
  });

  it('assert :: delete key (from key)', async () => {
    const client = BucketTester.getClientMock('bucket', {
      keys: {
        foo: Buffer.from(defaultContent)
      }
    });

    await client.delete('foo');

    equal(client.delete.mock.callCount(), 1);

    const exists = await client.exists('foo');

    equal(exists, false);
  });

  it('assert :: write key (create key)', async () => {
    const client = BucketTester.getClientMock('bucket');

    equal(await client.exists('foo'), false);

    await client.write('foo', defaultContent);

    equal(client.write.mock.callCount(), 1);
    equal(await client.exists('foo'), true);

    const result = await client.read('foo');

    equal(result.toString(), defaultContent);
  });

  it('assert :: write key (update key)', async () => {
    const client = BucketTester.getClientMock('bucket', {
      keys: {
        foo: Buffer.from(defaultContent)
      }
    });

    await client.write('foo', 'new content');

    equal(client.write.mock.callCount(), 1);

    const result = await client.read('foo');

    equal(result.toString(), 'new content');
  });

  it('assert :: get read url', async () => {
    const client = BucketTester.getClientMock('bucket');

    const url = await client.getReadUrl('foo', {
      expiresIn: 123
    });

    equal(client.getReadUrl.mock.callCount(), 1);
    equal(url, 'http://bucket/foo');
  });

  it('assert :: get write url', async () => {
    const client = BucketTester.getClientMock('bucket');

    const url = await client.getWriteUrl('foo', {
      contentType: 'plain/text',
      expiresIn: 123
    });

    equal(client.getWriteUrl.mock.callCount(), 1);
    equal(url, 'http://bucket/foo');
  });
});
