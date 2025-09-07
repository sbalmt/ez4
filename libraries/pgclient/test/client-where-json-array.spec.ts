import { makeSchemaClient, prepareSchemaTable } from './common/database';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where json array', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          json: {
            array: [1, 2, 3]
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          json: {
            array: ['foo', 'bar', 'baz']
          }
        },
        {
          id: randomUUID(),
          integer: 3,
          json: {
            array: [1, 'foo', 2, 'bar']
          }
        }
      ]
    });
  });

  it('assert :: where json array (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          array: [1, 2, 3]
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { array: [1, 2, 3] } }]);
  });

  it('assert :: where json array (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          array: {
            equal: [1, 'foo', 2, 'bar']
          }
        }
      }
    });

    deepEqual(records, [{ integer: 3, json: { array: [1, 'foo', 2, 'bar'] } }]);
  });

  it('assert :: where json array (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          array: {
            not: [1, 2, 3]
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 2, json: { array: ['foo', 'bar', 'baz'] } },
      { integer: 3, json: { array: [1, 'foo', 2, 'bar'] } }
    ]);
  });

  it('assert :: where json array (is in)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          array: {
            isIn: ['foo', 'bar', 'baz']
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { array: ['foo', 'bar', 'baz'] } }]);
  });

  it('assert :: where json array (contains)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          array: {
            contains: ['baz']
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { array: ['foo', 'bar', 'baz'] } }]);
  });

  it('assert :: where json array (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        NOT: {
          json: {
            array: ['foo', 'bar', 'baz']
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { array: [1, 2, 3] } },
      { integer: 3, json: { array: [1, 'foo', 2, 'bar'] } }
    ]);
  });

  it('assert :: where json array (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        AND: [
          {
            json: {
              array: [1, 2, 3]
            }
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 1, json: { array: [1, 2, 3] } }]);
  });

  it('assert :: where json array (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        OR: [
          {
            json: {
              array: [1, 2, 3]
            }
          },
          {
            json: {
              array: ['foo', 'bar', 'baz']
            }
          }
        ]
      }
    });

    deepEqual(records, [
      { integer: 1, json: { array: [1, 2, 3] } },
      { integer: 2, json: { array: ['foo', 'bar', 'baz'] } }
    ]);
  });
});
