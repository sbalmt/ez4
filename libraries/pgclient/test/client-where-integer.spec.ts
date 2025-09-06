import { makeClient, prepareTable } from './common/database';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where integer', async () => {
  const client = await makeClient();

  before(async () => {
    await prepareTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          string: 'foo'
        },
        {
          id: randomUUID(),
          integer: 2,
          string: 'bar'
        }
      ]
    });
  });

  it('assert :: where integer (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        integer: 2
      }
    });

    deepEqual(records, [{ integer: 2, string: 'bar' }]);
  });

  it('assert :: where integer (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        integer: {
          equal: 1
        }
      }
    });

    deepEqual(records, [{ integer: 1, string: 'foo' }]);
  });

  it('assert :: where integer (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        integer: {
          not: 1
        }
      }
    });

    deepEqual(records, [{ integer: 2, string: 'bar' }]);
  });

  it('assert :: where integer (greater than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        integer: {
          gt: 0
        }
      }
    });

    deepEqual(records, [
      { integer: 1, string: 'foo' },
      { integer: 2, string: 'bar' }
    ]);
  });

  it('assert :: where integer (greater than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        integer: {
          gte: 2
        }
      }
    });

    deepEqual(records, [{ integer: 2, string: 'bar' }]);
  });

  it('assert :: where integer (less than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        integer: {
          lt: 2
        }
      }
    });

    deepEqual(records, [{ integer: 1, string: 'foo' }]);
  });

  it('assert :: where integer (less than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        integer: {
          lte: 2
        }
      }
    });

    deepEqual(records, [
      { integer: 1, string: 'foo' },
      { integer: 2, string: 'bar' }
    ]);
  });

  it('assert :: where integer (is in)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        integer: {
          isIn: [1, 2]
        }
      }
    });

    deepEqual(records, [
      { integer: 1, string: 'foo' },
      { integer: 2, string: 'bar' }
    ]);
  });

  it('assert :: where integer (is between)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        integer: {
          isBetween: [1, 2]
        }
      }
    });

    deepEqual(records, [
      { integer: 1, string: 'foo' },
      { integer: 2, string: 'bar' }
    ]);
  });

  it('assert :: where integer (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        NOT: {
          integer: 2
        }
      }
    });

    deepEqual(records, [{ integer: 1, string: 'foo' }]);
  });

  it('assert :: where integer (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        AND: [
          {
            integer: 2
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 2, string: 'bar' }]);
  });

  it('assert :: where integer (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        OR: [
          {
            integer: 1
          },
          {
            integer: 2
          }
        ]
      }
    });

    deepEqual(records, [
      { integer: 1, string: 'foo' },
      { integer: 2, string: 'bar' }
    ]);
  });
});
