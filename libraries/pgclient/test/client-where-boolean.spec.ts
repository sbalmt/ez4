import { makeClient, prepareTable } from './common/database';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where boolean', async () => {
  const client = await makeClient();

  before(async () => {
    await prepareTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          boolean: true,
          integer: 1
        },
        {
          id: randomUUID(),
          boolean: false,
          integer: 2
        }
      ]
    });
  });

  it('assert :: where boolean (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        boolean: true,
        integer: true
      },
      where: {
        boolean: false
      }
    });

    deepEqual(records, [{ boolean: false, integer: 2 }]);
  });

  it('assert :: where boolean (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        boolean: true,
        integer: true
      },
      where: {
        boolean: {
          equal: true
        }
      }
    });

    deepEqual(records, [{ boolean: true, integer: 1 }]);
  });

  it('assert :: where boolean (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        boolean: true,
        integer: true
      },
      where: {
        boolean: {
          not: true
        }
      }
    });

    deepEqual(records, [{ boolean: false, integer: 2 }]);
  });

  it('assert :: where boolean (is in)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        boolean: true,
        integer: true
      },
      where: {
        boolean: {
          isIn: [true, false]
        }
      }
    });

    deepEqual(records, [
      { boolean: true, integer: 1 },
      { boolean: false, integer: 2 }
    ]);
  });

  it('assert :: where boolean (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        boolean: true,
        integer: true
      },
      where: {
        NOT: {
          boolean: false
        }
      }
    });

    deepEqual(records, [{ boolean: true, integer: 1 }]);
  });

  it('assert :: where boolean (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        boolean: true,
        integer: true
      },
      where: {
        AND: [
          {
            boolean: false
          }
        ]
      }
    });

    deepEqual(records, [{ boolean: false, integer: 2 }]);
  });

  it('assert :: where boolean (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        boolean: true,
        integer: true
      },
      where: {
        OR: [
          {
            boolean: true
          },
          {
            boolean: false
          }
        ]
      }
    });

    deepEqual(records, [
      { boolean: true, integer: 1 },
      { boolean: false, integer: 2 }
    ]);
  });
});
