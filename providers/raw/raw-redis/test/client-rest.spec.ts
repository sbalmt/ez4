import { after, describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { Client } from '@ez4/raw-redis/client';

describe('cache client (rest)', { timeout: 600000 }, () => {
  const otherIdentifier = 'test-rest-other';
  const cacheIdentifier = 'test-rest';

  const connection = {
    url: 'http://127.0.0.1:8079',
    token: 'ez4'
  };

  const cacheClient = Client.make({
    identifier: cacheIdentifier,
    prefix: 'test-rest:',
    connection
  });

  const otherClient = Client.make({
    identifier: otherIdentifier,
    prefix: 'test-rest-other:',
    connection
  });

  after(() => {
    Client.dispose(otherIdentifier);
    Client.dispose(cacheIdentifier);
  });

  it('assert :: flush operation', async () => {
    ok(cacheClient);

    await cacheClient.flush();
    await otherClient.flush();
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

  it('assert :: get operation (raw values)', async () => {
    ok(cacheClient);

    await cacheClient.set('Key-R1', '123');
    await cacheClient.set('Key-R2', '{"foo":true}');

    const valueA = await cacheClient.get('Key-R1');
    const valueB = await cacheClient.get('Key-R2');

    equal(valueA, '123');
    equal(valueB, '{"foo":true}');

    await cacheClient.delete('Key-R1', 'Key-R2');
  });

  it('assert :: delete operation', async () => {
    ok(cacheClient);

    const resultA = await cacheClient.delete('Key-B', 'Key-C');
    const resultB = await cacheClient.delete();

    equal(resultA, 1);
    equal(resultB, 0);
  });

  it('assert :: exists operation', async () => {
    ok(cacheClient);

    const resultA = await cacheClient.exists('Key-A', 'Key-B', 'Key-C');
    const resultB = await cacheClient.exists();

    equal(resultA, 1);
    equal(resultB, 0);
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

  it('assert :: prefix isolation', async () => {
    ok(cacheClient);

    await otherClient.set('Key-I', 'other');

    const valueA = await cacheClient.get('Key-I');
    const valueB = await otherClient.get('Key-I');

    equal(valueA, undefined);
    equal(valueB, 'other');
  });

  it('assert :: flush operation (prefix only)', async () => {
    ok(cacheClient);

    await cacheClient.flush();

    const resultA = await cacheClient.exists('Key-B', 'Key-N');
    const resultB = await otherClient.exists('Key-I');

    equal(resultA, 0);
    equal(resultB, 1);

    await otherClient.flush();
  });
});
