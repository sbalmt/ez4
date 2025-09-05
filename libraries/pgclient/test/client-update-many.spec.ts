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

  it('assert :: update many (without select)', async () => {
    const data = {
      boolean: true
    };

    const previous = await client.ez4_test_table.updateMany({
      data
    });

    deepEqual(previous, undefined);

    const { records } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        boolean: true
      }
    });

    deepEqual(records, [data, data, data]);
  });

  it('assert :: update many and select boolean', async () => {
    const data = {
      boolean: true
    };

    const previous = await client.ez4_test_table.updateMany({
      data,
      select: {
        boolean: true
      }
    });

    deepEqual(previous, [{ boolean: true }, { boolean: false }, { boolean: true }]);

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

    const previous = await client.ez4_test_table.updateMany({
      data,
      select: {
        integer: true
      }
    });

    deepEqual(previous, [{ integer: 1 }, { integer: 22 }, { integer: 333 }]);

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

    const previous = await client.ez4_test_table.updateMany({
      data,
      select: {
        decimal: true
      }
    });

    deepEqual(previous, [{ decimal: 0.1 }, { decimal: 1.22 }, { decimal: 2.333 }]);

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

    const previous = await client.ez4_test_table.updateMany({
      data,
      select: {
        string: true
      }
    });

    deepEqual(previous, [{ string: 'abc' }, { string: 'def' }, { string: 'ghi' }]);

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

    const previous = await client.ez4_test_table.updateMany({
      data,
      select: {
        datetime: true
      }
    });

    deepEqual(previous, [
      { datetime: '1991-04-23T23:59:30.000Z' },
      { datetime: '2011-11-02T13:30:00.000Z' },
      { datetime: '2024-07-01T08:00:00.000Z' }
    ]);

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

    const previous = await client.ez4_test_table.updateMany({
      data,
      select: {
        date: true
      }
    });

    deepEqual(previous, [{ date: '1991-04-23' }, { date: '2011-11-02' }, { date: '2024-07-01' }]);

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

    const previous = await client.ez4_test_table.updateMany({
      data,
      select: {
        time: true
      }
    });

    deepEqual(previous, [{ time: '23:59:30.000Z' }, { time: '13:30:00.000Z' }, { time: '08:00:00.000Z' }]);

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

    const previous = await client.ez4_test_table.updateMany({
      data: input,
      select: {
        json: {
          foo: true,
          bar: true
        }
      }
    });

    deepEqual(previous, [
      {
        json: {
          foo: 'abc',
          bar: true
        }
      },
      {
        json: {
          foo: 'def',
          bar: false
        }
      },
      {
        json: {
          foo: 'ghi',
          bar: true
        }
      }
    ]);

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
