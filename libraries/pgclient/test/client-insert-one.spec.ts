import { makeSchemaClient, prepareSchemaTable } from './common/database';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client insert one', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);
  });

  it('assert :: insert one and select boolean', async () => {
    const id = randomUUID();

    const input = false;

    const result = await client.ez4_test_table.insertOne({
      select: {
        boolean: true
      },
      data: {
        boolean: input,
        id
      }
    });

    deepEqual(result, {
      boolean: input
    });
  });

  it('assert :: insert one and select integer', async () => {
    const id = randomUUID();

    const input = 122333;

    const result = await client.ez4_test_table.insertOne({
      select: {
        integer: true
      },
      data: {
        integer: input,
        id
      }
    });

    deepEqual(result, {
      integer: input
    });
  });

  it('assert :: insert one and select decimal', async () => {
    const id = randomUUID();

    const input = 10.5678;

    const result = await client.ez4_test_table.insertOne({
      select: {
        decimal: true
      },
      data: {
        decimal: input,
        id
      }
    });

    deepEqual(result, {
      decimal: input
    });
  });

  it('assert :: insert one and select string', async () => {
    const id = randomUUID();

    const input = 'abc';

    const result = await client.ez4_test_table.insertOne({
      select: {
        string: true
      },
      data: {
        string: input,
        id
      }
    });

    deepEqual(result, {
      string: input
    });
  });

  it('assert :: insert one and select date-time', async () => {
    const id = randomUUID();

    const input = '1991-04-23T23:59:30.000Z';

    const result = await client.ez4_test_table.insertOne({
      select: {
        datetime: true
      },
      data: {
        datetime: input,
        id
      }
    });

    deepEqual(result, {
      datetime: input
    });
  });

  it('assert :: insert one and select date', async () => {
    const id = randomUUID();

    const input = '1991-04-23';

    const result = await client.ez4_test_table.insertOne({
      select: {
        date: true
      },
      data: {
        date: input,
        id
      }
    });

    deepEqual(result, {
      date: input
    });
  });

  it('assert :: insert one and select time', async () => {
    const id = randomUUID();

    const input = '23:59:30.000Z';

    const result = await client.ez4_test_table.insertOne({
      select: {
        time: true
      },
      data: {
        time: input,
        id
      }
    });

    deepEqual(result, {
      time: input
    });
  });

  it('assert :: insert one and select json', async () => {
    const id = randomUUID();

    const input = {
      boolean: true,
      string: 'abc',
      number: null,
      datetime: '2024-07-01T08:00:00.000Z'
    };

    const result = await client.ez4_test_table.insertOne({
      select: {
        json: true
      },
      data: {
        json: input,
        id
      }
    });

    deepEqual(result, {
      json: input
    });
  });
});
