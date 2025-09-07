import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where json date', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          json: {
            date: '1991-04-23'
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          json: {
            date: '2024-07-01'
          }
        }
      ]
    });
  });

  it('assert :: where json date (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          date: '1991-04-23'
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { date: '1991-04-23' } }]);
  });

  it('assert :: where json date (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          date: {
            equal: '2024-07-01'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { date: '2024-07-01' } }]);
  });

  it('assert :: where json date (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          date: {
            not: '1991-04-23'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { date: '2024-07-01' } }]);
  });

  it('assert :: where json date (greater than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          date: {
            gt: '1900-01-01'
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { date: '1991-04-23' } },
      { integer: 2, json: { date: '2024-07-01' } }
    ]);
  });

  it('assert :: where json date (greater than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          date: {
            gte: '2024-07-01'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { date: '2024-07-01' } }]);
  });

  it('assert :: where json date (less than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          date: {
            lt: '2024-07-01'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { date: '1991-04-23' } }]);
  });

  it('assert :: where json date (less than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          date: {
            lte: '2100-01-01'
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { date: '1991-04-23' } },
      { integer: 2, json: { date: '2024-07-01' } }
    ]);
  });

  it('assert :: where json date (is between)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          date: {
            isBetween: ['1991-04-23', '2024-07-01']
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { date: '1991-04-23' } },
      { integer: 2, json: { date: '2024-07-01' } }
    ]);
  });

  it('assert :: where json date (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        NOT: {
          json: {
            date: '2024-07-01'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { date: '1991-04-23' } }]);
  });

  it('assert :: where json date (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        AND: [
          {
            json: {
              date: '2024-07-01'
            }
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 2, json: { date: '2024-07-01' } }]);
  });

  it('assert :: where json date (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        OR: [
          {
            json: {
              date: '1991-04-23'
            }
          },
          {
            json: {
              date: '2024-07-01'
            }
          }
        ]
      }
    });

    deepEqual(records, [
      { integer: 1, json: { date: '1991-04-23' } },
      { integer: 2, json: { date: '2024-07-01' } }
    ]);
  });
});
