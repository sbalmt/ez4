import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual, equal } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client delete many', async () => {
  const client = await makeSchemaClient();

  beforeEach(async () => {
    await prepareSchemaTable(client);

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
            boolean: true,
            string: 'abc'
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
            boolean: false,
            string: 'def',
            number: 123
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
            boolean: true,
            string: 'ghi',
            datetime: '2013-02-16T20:00:00.000Z'
          }
        }
      ]
    });
  });

  it('assert :: delete many (without select)', async () => {
    const records = await client.ez4_test_table.deleteMany({});

    deepEqual(records, undefined);

    const total = await client.ez4_test_table.count({});

    equal(total, 0);
  });

  it('assert :: delete many and select boolean', async () => {
    const output = [{ boolean: true }, { boolean: false }, { boolean: true }];

    const records = await client.ez4_test_table.deleteMany({
      select: {
        boolean: true
      }
    });

    deepEqual(records, output);

    const total = await client.ez4_test_table.count({});

    equal(total, 0);
  });

  it('assert :: delete many and select integer', async () => {
    const output = [{ integer: 1 }, { integer: 22 }, { integer: 333 }];

    const records = await client.ez4_test_table.deleteMany({
      select: {
        integer: true
      }
    });

    deepEqual(records, output);

    const total = await client.ez4_test_table.count({});

    equal(total, 0);
  });

  it('assert :: delete many and select decimal', async () => {
    const output = [{ decimal: 0.1 }, { decimal: 1.22 }, { decimal: 2.333 }];

    const records = await client.ez4_test_table.deleteMany({
      select: {
        decimal: true
      }
    });

    deepEqual(records, output);

    const total = await client.ez4_test_table.count({});

    equal(total, 0);
  });

  it('assert :: delete many and select string', async () => {
    const output = [{ string: 'abc' }, { string: 'def' }, { string: 'ghi' }];

    const records = await client.ez4_test_table.deleteMany({
      select: {
        string: true
      }
    });

    deepEqual(records, output);

    const total = await client.ez4_test_table.count({});

    equal(total, 0);
  });

  it('assert :: delete many and select date-time', async () => {
    const output = [
      { datetime: '1991-04-23T23:59:30.000Z' },
      { datetime: '2011-11-02T13:30:00.000Z' },
      { datetime: '2024-07-01T08:00:00.000Z' }
    ];

    const records = await client.ez4_test_table.deleteMany({
      select: {
        datetime: true
      }
    });

    deepEqual(records, output);

    const total = await client.ez4_test_table.count({});

    equal(total, 0);
  });

  it('assert :: delete many and select date', async () => {
    const output = [{ date: '1991-04-23' }, { date: '2011-11-02' }, { date: '2024-07-01' }];

    const records = await client.ez4_test_table.deleteMany({
      select: {
        date: true
      }
    });

    deepEqual(records, output);

    const total = await client.ez4_test_table.count({});

    equal(total, 0);
  });

  it('assert :: delete many and select time', async () => {
    const output = [{ time: '23:59:30.000Z' }, { time: '13:30:00.000Z' }, { time: '08:00:00.000Z' }];

    const records = await client.ez4_test_table.deleteMany({
      select: {
        time: true
      }
    });

    deepEqual(records, output);

    const total = await client.ez4_test_table.count({});

    equal(total, 0);
  });

  it('assert :: delete many and select json', async () => {
    const records = await client.ez4_test_table.deleteMany({
      select: {
        json: true
      }
    });

    deepEqual(records, [
      {
        json: {
          boolean: true,
          string: 'abc'
        }
      },
      {
        json: {
          boolean: false,
          string: 'def',
          number: 123
        }
      },
      {
        json: {
          boolean: true,
          string: 'ghi',
          datetime: '2013-02-16T20:00:00.000Z'
        }
      }
    ]);

    const total = await client.ez4_test_table.count({});

    equal(total, 0);
  });
});
