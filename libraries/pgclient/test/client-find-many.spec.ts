import { makeClient, prepareTable } from './common/database';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual, equal } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client find many', async () => {
  const client = await makeClient();

  beforeEach(async () => {
    await prepareTable(client);

    await client.ez4_test_table.insertMany({
      data: Array.from({ length: 20 }).map((_, index) => ({
        id: randomUUID(),
        boolean: !!(index & 0b1),
        integer: index + 1,
        decimal: index / 100,
        string: `abc-${index + 1}`,
        datetime: `1991-04-${index + 10}T23:59:30.000Z`,
        date: `1991-04-${index + 10}`,
        time: `23:${index + 39}:30.000Z`,
        json: {
          foo: `foo-${index}`,
          bar: !(index & 0b1)
        }
      }))
    });
  });

  it('assert :: find many booleans', async () => {
    const inputs = [{ boolean: true }, { boolean: false }, { boolean: true }];

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      skip: 5,
      take: 3,
      select: {
        boolean: true
      }
    });

    deepEqual(records, inputs);

    equal(total, 20);
  });

  it('assert :: find many integers', async () => {
    const inputs = [{ integer: 16 }, { integer: 17 }, { integer: 18 }];

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      skip: 15,
      take: 3,
      select: {
        integer: true
      }
    });

    deepEqual(records, inputs);

    equal(total, 20);
  });

  it('assert :: find many decimals', async () => {
    const inputs = [{ decimal: 0.08 }, { decimal: 0.09 }, { decimal: 0.1 }];

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      skip: 8,
      take: 3,
      select: {
        decimal: true
      }
    });

    deepEqual(records, inputs);

    equal(total, 20);
  });

  it('assert :: find many strings', async () => {
    const inputs = [{ string: 'abc-1' }, { string: 'abc-2' }, { string: 'abc-3' }];

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      skip: 0,
      take: 3,
      select: {
        string: true
      }
    });

    deepEqual(records, inputs);

    equal(total, 20);
  });

  it('assert :: find many date-times', async () => {
    const inputs = [
      { datetime: '1991-04-22T23:59:30.000Z' },
      { datetime: '1991-04-23T23:59:30.000Z' },
      { datetime: '1991-04-24T23:59:30.000Z' }
    ];

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      skip: 12,
      take: 3,
      select: {
        datetime: true
      }
    });

    deepEqual(records, inputs);

    equal(total, 20);
  });

  it('assert :: find many dates', async () => {
    const inputs = [{ date: '1991-04-22' }, { date: '1991-04-23' }, { date: '1991-04-24' }];

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      skip: 12,
      take: 3,
      select: {
        date: true
      }
    });

    deepEqual(records, inputs);

    equal(total, 20);
  });

  it('assert :: find many times', async () => {
    const inputs = [{ time: '23:50:30.000Z' }, { time: '23:51:30.000Z' }, { time: '23:52:30.000Z' }];

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      skip: 11,
      take: 3,
      select: {
        time: true
      }
    });

    deepEqual(records, inputs);

    equal(total, 20);
  });

  it('assert :: find many jsons', async () => {
    const inputs = [
      {
        json: { foo: 'foo-17', bar: false }
      },
      {
        json: { foo: 'foo-18', bar: true }
      },
      {
        json: { foo: 'foo-19', bar: false }
      }
    ];

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      skip: 17,
      take: 3,
      select: {
        json: true
      }
    });

    deepEqual(records, inputs);

    equal(total, 20);
  });
});
