import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where decimal', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          decimal: 1.5,
          string: 'foo'
        },
        {
          id: randomUUID(),
          decimal: 2.5,
          string: 'bar'
        }
      ]
    });
  });

  it('assert :: where decimal (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        decimal: true,
        string: true
      },
      where: {
        decimal: 2.5
      }
    });

    deepEqual(records, [{ decimal: 2.5, string: 'bar' }]);
  });

  it('assert :: where decimal (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        decimal: true,
        string: true
      },
      where: {
        decimal: {
          equal: 1.5
        }
      }
    });

    deepEqual(records, [{ decimal: 1.5, string: 'foo' }]);
  });

  it('assert :: where decimal (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        decimal: true,
        string: true
      },
      where: {
        decimal: {
          not: 1.5
        }
      }
    });

    deepEqual(records, [{ decimal: 2.5, string: 'bar' }]);
  });

  it('assert :: where decimal (greater than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        decimal: true,
        string: true
      },
      where: {
        decimal: {
          gt: 0
        }
      }
    });

    deepEqual(records, [
      { decimal: 1.5, string: 'foo' },
      { decimal: 2.5, string: 'bar' }
    ]);
  });

  it('assert :: where decimal (greater than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        decimal: true,
        string: true
      },
      where: {
        decimal: {
          gte: 1.9
        }
      }
    });

    deepEqual(records, [{ decimal: 2.5, string: 'bar' }]);
  });

  it('assert :: where decimal (less than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        decimal: true,
        string: true
      },
      where: {
        decimal: {
          lt: 1.9
        }
      }
    });

    deepEqual(records, [{ decimal: 1.5, string: 'foo' }]);
  });

  it('assert :: where decimal (less than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        decimal: true,
        string: true
      },
      where: {
        decimal: {
          lte: 2.55
        }
      }
    });

    deepEqual(records, [
      { decimal: 1.5, string: 'foo' },
      { decimal: 2.5, string: 'bar' }
    ]);
  });

  it('assert :: where decimal (is in)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        decimal: true,
        string: true
      },
      where: {
        decimal: {
          isIn: [1.5, 2.5]
        }
      }
    });

    deepEqual(records, [
      { decimal: 1.5, string: 'foo' },
      { decimal: 2.5, string: 'bar' }
    ]);
  });

  it('assert :: where decimal (is between)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        decimal: true,
        string: true
      },
      where: {
        decimal: {
          isBetween: [1.1, 2.9]
        }
      }
    });

    deepEqual(records, [
      { decimal: 1.5, string: 'foo' },
      { decimal: 2.5, string: 'bar' }
    ]);
  });

  it('assert :: where decimal (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        decimal: true,
        string: true
      },
      where: {
        NOT: {
          decimal: 2.5
        }
      }
    });

    deepEqual(records, [{ decimal: 1.5, string: 'foo' }]);
  });

  it('assert :: where decimal (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        decimal: true,
        string: true
      },
      where: {
        AND: [
          {
            decimal: 2.5
          }
        ]
      }
    });

    deepEqual(records, [{ decimal: 2.5, string: 'bar' }]);
  });

  it('assert :: where decimal (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        decimal: true,
        string: true
      },
      where: {
        OR: [
          {
            decimal: 1.5
          },
          {
            decimal: 2.5
          }
        ]
      }
    });

    deepEqual(records, [
      { decimal: 1.5, string: 'foo' },
      { decimal: 2.5, string: 'bar' }
    ]);
  });
});
