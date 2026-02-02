import { deepEqual, equal, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BucketTester } from '@ez4/local-storage/test';

describe('local storage tests', () => {
  const defaultContent = 'This is a mocked content';

  // Minimal valid PNG (1x1 transparent pixel)
  const pngContent = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00,
    0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63,
    0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
  ]);

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

    const stats = await client.getStats('random-key');

    equal(client.getStats.mock.callCount(), 1);
    equal(stats, undefined);
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

  it('assert :: key stats (mime type detection)', async () => {
    const client = BucketTester.getClientMock('bucket', {
      keys: {
        'image.png': pngContent
      }
    });

    const stats = await client.getStats('image.png');

    equal(client.getStats.mock.callCount(), 1);

    deepEqual(stats, {
      type: 'image/png',
      size: pngContent.length
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

  it('assert :: get stats url', async () => {
    const client = BucketTester.getClientMock('bucket');

    const url = await client.getStatsUrl('foo', {
      expiresIn: 123
    });

    equal(client.getStatsUrl.mock.callCount(), 1);
    equal(url, 'http://bucket/foo');
  });
});
