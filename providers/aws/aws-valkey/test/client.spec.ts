import { after, describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { Client } from '@ez4/aws-valkey/client';

describe('cache client', () => {
  const cacheIdentifier = 'test';

  const cacheClient = Client.make({
    identifier: cacheIdentifier,
    connection: {
      endpoint: '127.0.0.1',
      port: 6379,
      tls: false
    }
  });

  after(() => {
    Client.dispose(cacheIdentifier);
  });

  it('assert :: flush operation', async () => {
    ok(cacheClient);

    await cacheClient.flush();
  });

  it('assert :: set operation', async () => {
    ok(cacheClient);

    await cacheClient.set('Key-A', 'foo');
  });

  it('assert :: set operation (with TTL)', async () => {
    ok(cacheClient);

    await cacheClient.set('Key-B', 'bar', {
      ttl: 5
    });
  });

  it('assert :: get operation', async () => {
    ok(cacheClient);

    const valueA = await cacheClient.get('Key-A');
    const valueB = await cacheClient.get('Key-B');
    const valueC = await cacheClient.get('Key-C');

    equal(valueA, 'foo');
    equal(valueB, 'bar');
    equal(valueC, undefined);
  });

  it('assert :: delete operation', async () => {
    ok(cacheClient);

    const result = await cacheClient.delete('Key-B', 'Key-C');

    equal(result, 1);
  });

  it('assert :: exists operation', async () => {
    ok(cacheClient);

    const result = await cacheClient.exists('Key-B', 'Key-C');

    equal(result, 0);
  });

  it('assert :: set TTL operation', async () => {
    ok(cacheClient);

    const resultA = await cacheClient.setTTL('Key-A', 10);
    const resultB = await cacheClient.setTTL('Key-B', 5);

    equal(resultA, true);
    equal(resultB, false);
  });

  it('assert :: get TTL operation', async () => {
    ok(cacheClient);

    const resultA = await cacheClient.getTTL('Key-A');
    const resultB = await cacheClient.getTTL('Key-B');

    equal(resultA, 10);
    equal(resultB, undefined);
  });

  it('assert :: rename operation', async () => {
    ok(cacheClient);

    const resultA = await cacheClient.rename('Key-A', 'Key-A');
    const resultB = await cacheClient.rename('Key-A', 'Key-B');

    equal(resultA, false);
    equal(resultB, true);
  });

  it('assert :: increment operation', async () => {
    ok(cacheClient);

    const resultA = await cacheClient.increment('Key-N');
    const resultB = await cacheClient.increment('Key-N', 5);

    equal(resultA, 1);
    equal(resultB, 6);
  });

  it('assert :: decrement operation', async () => {
    ok(cacheClient);

    const resultA = await cacheClient.decrement('Key-N');
    const resultB = await cacheClient.decrement('Key-N', 5);

    equal(resultA, 5);
    equal(resultB, 0);
  });
});
