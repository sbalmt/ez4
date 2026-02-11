import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { Client } from '@ez4/aws-valkey/client';
import { setTimeout } from 'node:timers/promises';

describe('cache client', () => {
  const cacheClient = Client.make({
    endpoint: '127.0.0.1',
    port: 6379,
    tls: false
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

  it('assert :: expire operation', async () => {
    ok(cacheClient);

    const resultA = await cacheClient.expire('Key-A', 10);
    const resultB = await cacheClient.expire('Key-B', 5);

    equal(resultA, true);
    equal(resultB, false);
  });

  it('assert :: reconnection', async () => {
    ok(cacheClient);

    // Make the first connection
    await cacheClient.set('Key-Z', 'foo');

    // Wait for internal idle timeout to close the connection
    await setTimeout(2000);

    // Make the second connection
    const result = await cacheClient.get('Key-Z');

    equal(result, 'foo');
  });
});
