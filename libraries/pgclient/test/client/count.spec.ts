import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { beforeEach, describe, it } from 'node:test';
import { equal } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client count', async () => {
  const client = await makeSchemaClient();

  beforeEach(async () => {
    await prepareSchemaTable(client);

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
          number: index + 15
        }
      }))
    });
  });

  it('assert :: count all', async () => {
    const total = await client.ez4_test_table.count({});

    equal(total, 20);
  });

  it('assert :: count filter boolean', async () => {
    const total = await client.ez4_test_table.count({
      where: {
        boolean: true
      }
    });

    equal(total, 10);
  });

  it('assert :: count filter integer', async () => {
    const total = await client.ez4_test_table.count({
      where: {
        integer: {
          gt: 8,
          lt: 13
        }
      }
    });

    equal(total, 4);
  });

  it('assert :: count filter decimal', async () => {
    const total = await client.ez4_test_table.count({
      where: {
        decimal: {
          gt: 0.05,
          lt: 0.1
        }
      }
    });

    equal(total, 4);
  });

  it('assert :: count filter string', async () => {
    const total = await client.ez4_test_table.count({
      where: {
        string: {
          contains: 'c-1'
        }
      }
    });

    equal(total, 11);
  });

  it('assert :: count filter date-time', async () => {
    const total = await client.ez4_test_table.count({
      where: {
        datetime: {
          gt: '1991-04-19T00:00:00Z'
        }
      }
    });

    equal(total, 11);
  });

  it('assert :: count filter date', async () => {
    const total = await client.ez4_test_table.count({
      where: {
        date: {
          gte: '1991-04-23'
        }
      }
    });

    equal(total, 7);
  });

  it('assert :: count filter time', async () => {
    const total = await client.ez4_test_table.count({
      where: {
        time: {
          lte: '23:43:30'
        }
      }
    });

    equal(total, 5);
  });

  it('assert :: count filter json', async () => {
    const total = await client.ez4_test_table.count({
      where: {
        json: {
          number: {
            gt: 20,
            lt: 30
          }
        }
      }
    });

    equal(total, 9);
  });
});
