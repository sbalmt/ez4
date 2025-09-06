import { makeSchemaClient, prepareSchemaTable } from './common/database';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client find one', async () => {
  const client = await makeSchemaClient();

  const id = randomUUID();

  before(async () => {
    await prepareSchemaTable(client);

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

  it('assert :: find one boolean', async () => {
    const result = await client.ez4_test_table.findOne({
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
  });

  it('assert :: find one integer', async () => {
    const result = await client.ez4_test_table.findOne({
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
  });

  it('assert :: find one decimal', async () => {
    const result = await client.ez4_test_table.findOne({
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
  });

  it('assert :: find one string', async () => {
    const result = await client.ez4_test_table.findOne({
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
  });

  it('assert :: find one date-time', async () => {
    const result = await client.ez4_test_table.findOne({
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
  });

  it('assert :: find one date', async () => {
    const result = await client.ez4_test_table.findOne({
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
  });

  it('assert :: find one time', async () => {
    const result = await client.ez4_test_table.findOne({
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
  });

  it('assert :: find one json (all fields)', async () => {
    const result = await client.ez4_test_table.findOne({
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
  });

  it('assert :: find one json (single field)', async () => {
    const result = await client.ez4_test_table.findOne({
      select: {
        json: {
          baz: true
        }
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      json: {
        baz: null
      }
    });
  });

  it('assert :: find one json (multiple field)', async () => {
    const result = await client.ez4_test_table.findOne({
      select: {
        json: {
          foo: true,
          baz: true
        }
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      json: {
        foo: 'abc',
        baz: null
      }
    });
  });
});
