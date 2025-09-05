import { makeClient, prepareTable } from './common/database';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual, equal } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client update many', async () => {
  const client = await makeClient();

  beforeEach(async () => {
    await prepareTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          boolean: true,
          integer: 1,
          decimal: 0.1,
          string: 'abc',
          datetime: '1991-04-23T23:59:30.000Z',
          date: '1991-04-23',
          time: '23:59:30.000Z',
          json: {
            foo: 'abc',
            bar: true
          }
        },
        {
          id: randomUUID(),
          boolean: false,
          integer: 22,
          decimal: 1.22,
          string: 'def',
          datetime: '2011-11-02T13:30:00.000Z',
          date: '2011-11-02',
          time: '13:30:00.000Z',
          json: {
            foo: 'def',
            bar: false,
            baz: 123
          }
        },
        {
          id: randomUUID(),
          boolean: true,
          integer: 333,
          decimal: 2.333,
          string: 'ghi',
          datetime: '2024-07-01T08:00:00.000Z',
          date: '2024-07-01',
          time: '08:00:00.000Z',
          json: {
            foo: 'ghi',
            bar: true,
            qux: '2013-02-16T20:00:00.000Z'
          }
        }
      ]
    });
  });

  it('assert :: update many and select boolean', async () => {
    const data = {
      boolean: true
    };

    await client.ez4_test_table.updateMany({
      data
    });

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        boolean: true
      }
    });

    deepEqual(records, [data, data, data]);

    equal(total, 3);
  });

  it('assert :: update many and select integer', async () => {
    const data = {
      integer: 123
    };

    await client.ez4_test_table.updateMany({
      data
    });

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        integer: true
      }
    });

    deepEqual(records, [data, data, data]);

    equal(total, 3);
  });

  it('assert :: update many and select decimal', async () => {
    const data = {
      decimal: 1.23
    };

    await client.ez4_test_table.updateMany({
      data
    });

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        decimal: true
      }
    });

    deepEqual(records, [data, data, data]);

    equal(total, 3);
  });

  it('assert :: update many and select string', async () => {
    const data = {
      string: 'foo'
    };

    await client.ez4_test_table.updateMany({
      data
    });

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        string: true
      }
    });

    deepEqual(records, [data, data, data]);

    equal(total, 3);
  });

  it('assert :: update many and select date-time', async () => {
    const data = {
      datetime: '2025-01-01T23:59:30.000Z'
    };

    await client.ez4_test_table.updateMany({
      data
    });

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        datetime: true
      }
    });

    deepEqual(records, [data, data, data]);

    equal(total, 3);
  });

  it('assert :: update many and select date', async () => {
    const data = {
      date: '2025-01-01'
    };

    await client.ez4_test_table.updateMany({
      data
    });

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        date: true
      }
    });

    deepEqual(records, [data, data, data]);

    equal(total, 3);
  });

  it('assert :: update many and select time', async () => {
    const data = {
      time: '23:59:30.000Z'
    };

    await client.ez4_test_table.updateMany({
      data
    });

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        time: true
      }
    });

    deepEqual(records, [data, data, data]);

    equal(total, 3);
  });

  it('assert :: update many and select json', async () => {
    const input = {
      json: {
        foo: 'foo',
        bar: true
      }
    };

    await client.ez4_test_table.updateMany({
      data: input
    });

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        json: true
      }
    });

    deepEqual(records, [
      {
        json: {
          ...input.json
        }
      },
      {
        json: {
          ...input.json,
          baz: 123
        }
      },
      {
        json: {
          ...input.json,
          qux: '2013-02-16T20:00:00.000Z'
        }
      }
    ]);

    equal(total, 3);
  });
});
