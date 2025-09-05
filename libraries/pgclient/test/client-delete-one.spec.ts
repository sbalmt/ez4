import { makeClient, prepareTable } from './common/database';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client delete one', async () => {
  const client = await makeClient();

  const id = randomUUID();

  beforeEach(async () => {
    await prepareTable(client);

    await client.ez4_test_table.insertOne({
      data: {
        boolean: false,
        integer: 122333,
        decimal: 10.5678,
        string: 'abc',
        datetime: '1991-04-23T23:59:30.000Z',
        date: '1991-04-23',
        time: '23:59:30.000Z',
        json: {
          foo: 'abc',
          bar: true,
          baz: null,
          qux: '2024-07-01T08:00:00.000Z'
        },
        id
      }
    });
  });

  it('assert :: delete one (without select)', async () => {
    const result = await client.ez4_test_table.deleteOne({
      where: {
        id
      }
    });

    deepEqual(result, undefined);
  });

  it('assert :: delete one and select boolean', async () => {
    const result = await client.ez4_test_table.deleteOne({
      select: {
        boolean: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      boolean: false
    });

    const changes = await client.ez4_test_table.findOne({
      select: {
        boolean: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, undefined);
  });

  it('assert :: delete one and select integer', async () => {
    const result = await client.ez4_test_table.deleteOne({
      select: {
        integer: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      integer: 122333
    });

    const changes = await client.ez4_test_table.findOne({
      select: {
        integer: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, undefined);
  });

  it('assert :: delete one and select decimal', async () => {
    const result = await client.ez4_test_table.deleteOne({
      select: {
        decimal: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      decimal: 10.5678
    });

    const changes = await client.ez4_test_table.findOne({
      select: {
        decimal: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, undefined);
  });

  it('assert :: delete one and select string', async () => {
    const result = await client.ez4_test_table.deleteOne({
      select: {
        string: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      string: 'abc'
    });

    const changes = await client.ez4_test_table.findOne({
      select: {
        string: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, undefined);
  });

  it('assert :: delete one and select date-time', async () => {
    const result = await client.ez4_test_table.deleteOne({
      select: {
        datetime: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      datetime: '1991-04-23T23:59:30.000Z'
    });

    const changes = await client.ez4_test_table.findOne({
      select: {
        datetime: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, undefined);
  });

  it('assert :: delete one and select date', async () => {
    const result = await client.ez4_test_table.deleteOne({
      select: {
        date: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      date: '1991-04-23'
    });

    const changes = await client.ez4_test_table.findOne({
      select: {
        date: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, undefined);
  });

  it('assert :: delete one and select time', async () => {
    const result = await client.ez4_test_table.deleteOne({
      select: {
        time: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      time: '23:59:30.000Z'
    });

    const changes = await client.ez4_test_table.findOne({
      select: {
        time: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, undefined);
  });

  it('assert :: delete one and select json', async () => {
    const result = await client.ez4_test_table.deleteOne({
      select: {
        json: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      json: {
        foo: 'abc',
        bar: true,
        baz: null,
        qux: '2024-07-01T08:00:00.000Z'
      }
    });

    const changes = await client.ez4_test_table.findOne({
      select: {
        json: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, undefined);
  });
});
