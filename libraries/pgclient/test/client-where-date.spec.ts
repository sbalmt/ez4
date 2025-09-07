import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where date', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          date: '1991-04-23'
        },
        {
          id: randomUUID(),
          integer: 2,
          date: '2024-07-01'
        }
      ]
    });
  });

  it('assert :: where date (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        date: true
      },
      where: {
        date: '1991-04-23'
      }
    });

    deepEqual(records, [{ date: '1991-04-23', integer: 1 }]);
  });

  it('assert :: where date (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        date: true
      },
      where: {
        date: {
          equal: '2024-07-01'
        }
      }
    });

    deepEqual(records, [{ date: '2024-07-01', integer: 2 }]);
  });

  it('assert :: where date (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        date: true
      },
      where: {
        date: {
          not: '1991-04-23'
        }
      }
    });

    deepEqual(records, [{ date: '2024-07-01', integer: 2 }]);
  });

  it('assert :: where date (greater than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        date: true
      },
      where: {
        date: {
          gt: '1900-01-01'
        }
      }
    });

    deepEqual(records, [
      { date: '1991-04-23', integer: 1 },
      { date: '2024-07-01', integer: 2 }
    ]);
  });

  it('assert :: where date (greater than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        date: true
      },
      where: {
        date: {
          gte: '2024-07-01'
        }
      }
    });

    deepEqual(records, [{ date: '2024-07-01', integer: 2 }]);
  });

  it('assert :: where date (less than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        date: true
      },
      where: {
        date: {
          lt: '2024-07-01'
        }
      }
    });

    deepEqual(records, [{ date: '1991-04-23', integer: 1 }]);
  });

  it('assert :: where date (less than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        date: true
      },
      where: {
        date: {
          lte: '2100-01-01'
        }
      }
    });

    deepEqual(records, [
      { date: '1991-04-23', integer: 1 },
      { date: '2024-07-01', integer: 2 }
    ]);
  });

  it('assert :: where date (is between)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        date: true
      },
      where: {
        date: {
          isBetween: ['1991-04-23', '2024-07-01']
        }
      }
    });

    deepEqual(records, [
      { date: '1991-04-23', integer: 1 },
      { date: '2024-07-01', integer: 2 }
    ]);
  });

  it('assert :: where date (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        date: true
      },
      where: {
        NOT: {
          date: '2024-07-01'
        }
      }
    });

    deepEqual(records, [{ date: '1991-04-23', integer: 1 }]);
  });

  it('assert :: where date (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        date: true
      },
      where: {
        AND: [
          {
            date: '2024-07-01'
          }
        ]
      }
    });

    deepEqual(records, [{ date: '2024-07-01', integer: 2 }]);
  });

  it('assert :: where date (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        date: true
      },
      where: {
        OR: [
          {
            date: '1991-04-23'
          },
          {
            date: '2024-07-01'
          }
        ]
      }
    });

    deepEqual(records, [
      { date: '1991-04-23', integer: 1 },
      { date: '2024-07-01', integer: 2 }
    ]);
  });
});
