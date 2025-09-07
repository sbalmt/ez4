import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where json boolean', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          json: {
            boolean: false,
            string: 'foo-1'
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          json: {
            boolean: true,
            string: 'foo-2'
          }
        }
      ]
    });
  });

  it('assert :: where json boolean (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          boolean: true
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { boolean: true, string: 'foo-2' } }]);
  });

  it('assert :: where json boolean (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          boolean: {
            equal: false
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { boolean: false, string: 'foo-1' } }]);
  });

  it('assert :: where json boolean (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          boolean: {
            not: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { boolean: false, string: 'foo-1' } }]);
  });

  it('assert :: where json boolean (is in)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          boolean: {
            isIn: [true, false]
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { boolean: false, string: 'foo-1' } },
      { integer: 2, json: { boolean: true, string: 'foo-2' } }
    ]);
  });

  it('assert :: where json boolean (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        NOT: {
          json: {
            boolean: false
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { boolean: true, string: 'foo-2' } }]);
  });

  it('assert :: where json boolean (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        AND: [
          {
            json: {
              boolean: false
            }
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 1, json: { boolean: false, string: 'foo-1' } }]);
  });

  it('assert :: where json boolean (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        OR: [
          {
            json: {
              boolean: false
            }
          },
          {
            json: {
              boolean: true
            }
          }
        ]
      }
    });

    deepEqual(records, [
      { integer: 1, json: { boolean: false, string: 'foo-1' } },
      { integer: 2, json: { boolean: true, string: 'foo-2' } }
    ]);
  });
});
