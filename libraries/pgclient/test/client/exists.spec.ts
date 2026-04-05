import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { beforeEach, describe, it } from 'node:test';
import { equal } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client exists test', async () => {
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
        time: `23:${index + 20}:30.000Z`,
        json: {
          number: index + 15
        }
      }))
    });
  });

  it('assert :: any exists', async () => {
    const result = await client.ez4_test_table.exists({});

    equal(result, true);
  });

  it('assert :: none exists', async () => {
    const result = await client.ez4_test_table.exists({
      where: {
        id: '00000000-0000-1000-9000-000000000000'
      }
    });

    equal(result, false);
  });

  it('assert :: some exists (filter boolean)', async () => {
    const result = await client.ez4_test_table.exists({
      where: {
        boolean: false
      }
    });

    equal(result, true);
  });

  it('assert :: some exists (filter integer)', async () => {
    const result = await client.ez4_test_table.exists({
      where: {
        integer: 5
      }
    });

    equal(result, true);
  });

  it('assert :: some exists (filter decimal)', async () => {
    const result = await client.ez4_test_table.exists({
      where: {
        decimal: 0.15
      }
    });

    equal(result, true);
  });

  it('assert :: some exists (filter string)', async () => {
    const result = await client.ez4_test_table.exists({
      where: {
        string: 'abc-1'
      }
    });

    equal(result, true);
  });

  it('assert :: some exists (filter date-time)', async () => {
    const result = await client.ez4_test_table.exists({
      where: {
        datetime: '1991-04-23T23:59:30.000Z'
      }
    });

    equal(result, true);
  });

  it('assert :: some exists (filter date)', async () => {
    const result = await client.ez4_test_table.exists({
      where: {
        date: '1991-04-23'
      }
    });

    equal(result, true);
  });

  it('assert :: some exists (filter time)', async () => {
    const result = await client.ez4_test_table.exists({
      where: {
        time: '23:20:30'
      }
    });

    equal(result, true);
  });

  it('assert :: some exists (filter json)', async () => {
    const result = await client.ez4_test_table.exists({
      where: {
        json: {
          number: 25
        }
      }
    });

    equal(result, true);
  });
});
