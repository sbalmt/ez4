import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where column string', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

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

  it('assert :: where column string (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        string: 'bar'
      }
    });

    deepEqual(records, [{ string: 'bar', integer: 2 }]);
  });

  it('assert :: where column string (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        string: {
          equal: 'foo'
        }
      }
    });

    deepEqual(records, [{ string: 'foo', integer: 1 }]);
  });

  it('assert :: where column string (insensitive equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        string: {
          equal: 'BaR',
          insensitive: true
        }
      }
    });

    deepEqual(records, [{ string: 'bar', integer: 2 }]);
  });

  it('assert :: where column string (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        string: {
          not: 'foo'
        }
      }
    });

    deepEqual(records, [{ string: 'bar', integer: 2 }]);
  });

  it('assert :: where column string (insensitive not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        string: {
          not: 'BAr',
          insensitive: true
        }
      }
    });

    deepEqual(records, [{ string: 'foo', integer: 1 }]);
  });

  it('assert :: where column string (greater than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        string: {
          gt: 'baq'
        }
      }
    });

    deepEqual(records, [
      { string: 'foo', integer: 1 },
      { string: 'bar', integer: 2 }
    ]);
  });

  it('assert :: where column string (greater than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        string: {
          gte: 'fon'
        }
      }
    });

    deepEqual(records, [{ string: 'foo', integer: 1 }]);
  });

  it('assert :: where column string (less than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        string: {
          lt: 'foo'
        }
      }
    });

    deepEqual(records, [{ string: 'bar', integer: 2 }]);
  });

  it('assert :: where column string (less than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        string: {
          lte: 'foo'
        }
      }
    });

    deepEqual(records, [
      { string: 'foo', integer: 1 },
      { string: 'bar', integer: 2 }
    ]);
  });

  it('assert :: where column string (is in)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        string: {
          isIn: ['foo', 'bar']
        }
      }
    });

    deepEqual(records, [
      { string: 'foo', integer: 1 },
      { string: 'bar', integer: 2 }
    ]);
  });

  it('assert :: where column string (is between)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        string: {
          isBetween: ['baq', 'fop']
        }
      }
    });

    deepEqual(records, [
      { string: 'foo', integer: 1 },
      { string: 'bar', integer: 2 }
    ]);
  });

  it('assert :: where column string (contains)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        string: {
          contains: 'o'
        }
      }
    });

    deepEqual(records, [{ string: 'foo', integer: 1 }]);
  });

  it('assert :: where column string (insensitive contains)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        string: {
          contains: 'A',
          insensitive: true
        }
      }
    });

    deepEqual(records, [{ string: 'bar', integer: 2 }]);
  });

  it('assert :: where column string (starts with)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        string: {
          startsWith: 'ba'
        }
      }
    });

    deepEqual(records, [{ string: 'bar', integer: 2 }]);
  });

  it('assert :: where column string (insensitive starts with)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        string: {
          startsWith: 'FO',
          insensitive: true
        }
      }
    });

    deepEqual(records, [{ string: 'foo', integer: 1 }]);
  });

  it('assert :: where column string (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        NOT: {
          string: 'bar'
        }
      }
    });

    deepEqual(records, [{ string: 'foo', integer: 1 }]);
  });

  it('assert :: where column string (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        AND: [
          {
            string: 'bar'
          }
        ]
      }
    });

    deepEqual(records, [{ string: 'bar', integer: 2 }]);
  });

  it('assert :: where column string (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        string: true
      },
      where: {
        OR: [
          {
            string: 'foo'
          },
          {
            string: 'bar'
          }
        ]
      }
    });

    deepEqual(records, [
      { string: 'foo', integer: 1 },
      { string: 'bar', integer: 2 }
    ]);
  });
});
