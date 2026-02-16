import { describe, it } from 'node:test';
import { equal } from 'assert/strict';

import { BucketTester } from '@ez4/local-storage/test';

describe('aws storage manager', () => {
  it('upload a file', async () => {
    const client = BucketTester.getClient('FileStorage');

    await client.write('test', 'Hello World');
  });

  it('download a file', async () => {
    const client = BucketTester.getClient('FileStorage');

    const buffer = await client.read('test');

    equal(buffer.toString(), 'Hello World');
  });

  it('delete a file', async () => {
    const client = BucketTester.getClient('FileStorage');

    await client.delete('test');
  });
});
