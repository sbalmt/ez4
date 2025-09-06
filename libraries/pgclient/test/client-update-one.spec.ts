import { makeSchemaClient, prepareSchemaTable } from './common/database';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client update one', async () => {
  const client = await makeSchemaClient();

  const id = randomUUID();

  beforeEach(async () => {
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

  it('assert :: update one (without select)', async () => {
    const previous = await client.ez4_test_table.updateOne({
      data: {
        boolean: true,
        integer: 123,
        json: {
          foo: 'new'
        }
      },
      where: {
        id
      }
    });

    deepEqual(previous, undefined);

    const changes = await client.ez4_test_table.findOne({
      select: {},
      where: {
        id
      }
    });

    deepEqual(changes, {
      boolean: true,
      integer: 123,
      decimal: 10.5678,
      string: 'abc',
      datetime: '1991-04-23T23:59:30.000Z',
      date: '1991-04-23',
      time: '23:59:30.000Z',
      json: {
        foo: 'new',
        bar: true,
        baz: null,
        qux: '2024-07-01T08:00:00.000Z'
      },
      id
    });
  });

  it('assert :: update one and select boolean', async () => {
    const previous = await client.ez4_test_table.updateOne({
      select: {
        boolean: true
      },
      data: {
        boolean: true
      },
      where: {
        id
      }
    });

    deepEqual(previous, {
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

    deepEqual(changes, {
      boolean: true
    });
  });

  it('assert :: update one and select integer', async () => {
    const previous = await client.ez4_test_table.updateOne({
      select: {
        integer: true
      },
      data: {
        integer: 444455555
      },
      where: {
        id
      }
    });

    deepEqual(previous, {
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

    deepEqual(changes, {
      integer: 444455555
    });
  });

  it('assert :: update one and select decimal', async () => {
    const previous = await client.ez4_test_table.updateOne({
      select: {
        decimal: true
      },
      data: {
        decimal: 9.01234
      },
      where: {
        id
      }
    });

    deepEqual(previous, {
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

    deepEqual(changes, {
      decimal: 9.01234
    });
  });

  it('assert :: update one and select string', async () => {
    const previous = await client.ez4_test_table.updateOne({
      select: {
        string: true
      },
      data: {
        string: 'def'
      },
      where: {
        id
      }
    });

    deepEqual(previous, {
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

    deepEqual(changes, {
      string: 'def'
    });
  });

  it('assert :: update one and select date-time', async () => {
    const previous = await client.ez4_test_table.updateOne({
      select: {
        datetime: true
      },
      data: {
        datetime: '2024-07-01T08:00:00.000Z'
      },
      where: {
        id
      }
    });

    deepEqual(previous, {
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

    deepEqual(changes, {
      datetime: '2024-07-01T08:00:00.000Z'
    });
  });

  it('assert :: update one and select date', async () => {
    const previous = await client.ez4_test_table.updateOne({
      select: {
        date: true
      },
      data: {
        date: '2024-07-01'
      },
      where: {
        id
      }
    });

    deepEqual(previous, {
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

    deepEqual(changes, {
      date: '2024-07-01'
    });
  });

  it('assert :: update one and select time', async () => {
    const previous = await client.ez4_test_table.updateOne({
      select: {
        time: true
      },
      data: {
        time: '00:00:00'
      },
      where: {
        id
      }
    });

    deepEqual(previous, {
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

    deepEqual(changes, {
      time: '00:00:00.000Z'
    });
  });

  it('assert :: update one and select json (all fields)', async () => {
    const previous = await client.ez4_test_table.updateOne({
      select: {
        json: true
      },
      data: {
        json: {
          foo: 'def',
          bar: false,
          baz: 123,
          qux: '1991-04-23T00:00:00.000Z'
        }
      },
      where: {
        id
      }
    });

    deepEqual(previous, {
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

    deepEqual(changes, {
      json: {
        foo: 'def',
        bar: false,
        baz: 123,
        qux: '1991-04-23T00:00:00.000Z'
      }
    });
  });

  it('assert :: update one and select json (single field)', async () => {
    const previous = await client.ez4_test_table.updateOne({
      select: {
        json: {
          baz: true
        }
      },
      data: {
        json: {
          baz: 321
        }
      },
      where: {
        id
      }
    });

    deepEqual(previous, {
      json: {
        baz: null
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

    deepEqual(changes, {
      json: {
        foo: 'abc',
        bar: true,
        baz: 321,
        qux: '2024-07-01T08:00:00.000Z'
      }
    });
  });

  it('assert :: update one and select json (multiple field)', async () => {
    const previous = await client.ez4_test_table.updateOne({
      select: {
        json: {
          foo: true,
          baz: true
        }
      },
      data: {
        json: {
          foo: 'def',
          baz: 321
        }
      },
      where: {
        id
      }
    });

    deepEqual(previous, {
      json: {
        foo: 'abc',
        baz: null
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

    deepEqual(changes, {
      json: {
        foo: 'def',
        bar: true,
        baz: 321,
        qux: '2024-07-01T08:00:00.000Z'
      }
    });
  });

  it('assert :: update one and select json (null fields)', async () => {
    const previousA = await client.ez4_test_table.updateOne({
      select: {
        json: true
      },
      data: {
        json: null
      },
      where: {
        id
      }
    });

    deepEqual(previousA, {
      json: {
        foo: 'abc',
        bar: true,
        baz: null,
        qux: '2024-07-01T08:00:00.000Z'
      }
    });

    const previousB = await client.ez4_test_table.updateOne({
      select: {
        json: true
      },
      data: {
        json: {
          foo: 'abc'
        }
      },
      where: {
        id
      }
    });

    deepEqual(previousB, {
      json: null
    });

    const changes = await client.ez4_test_table.findOne({
      select: {
        json: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      json: {
        foo: 'abc'
      }
    });
  });
});
