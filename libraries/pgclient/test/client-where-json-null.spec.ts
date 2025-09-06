import { makeClient, prepareTable } from './common/database';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where json null', async () => {
  const client = await makeClient();

  before(async () => {
    await prepareTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          json: {
            foo: 'foo-1',
            bar: true
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          json: {
            foo: 'foo-2',
            bar: true,
            baz: null
          }
        },
        {
          id: randomUUID(),
          integer: 3,
          json: {
            foo: 'foo-3',
            bar: true,
            baz: 3
          }
        }
      ]
    });
  });

  it('assert :: where json null (implicit)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        json: {
          baz: null
        }
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where json null (explicit)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        json: {
          baz: {
            equal: null
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where json null (operator)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        json: {
          baz: {
            isNull: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where json not null (explicit)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        json: {
          baz: {
            not: null
          }
        }
      }
    });

    deepEqual(records, [{ integer: 3 }]);
  });

  it('assert :: where json not null (operator)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        json: {
          baz: {
            isNull: false
          }
        }
      }
    });

    deepEqual(records, [{ integer: 3 }]);
  });
});
