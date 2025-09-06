import { makeClient, prepareTable } from './common/database';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where time', async () => {
  const client = await makeClient();

  before(async () => {
    await prepareTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          time: '00:00:00Z'
        },
        {
          id: randomUUID(),
          integer: 2,
          time: '23:59:59Z'
        }
      ]
    });
  });

  it('assert :: where time (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        time: true
      },
      where: {
        time: '00:00:00Z'
      }
    });

    deepEqual(records, [{ time: '00:00:00.000Z', integer: 1 }]);
  });

  it('assert :: where time (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        time: true
      },
      where: {
        time: {
          equal: '23:59:59Z'
        }
      }
    });

    deepEqual(records, [{ time: '23:59:59.000Z', integer: 2 }]);
  });

  it('assert :: where time (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        time: true
      },
      where: {
        time: {
          not: '00:00:00Z'
        }
      }
    });

    deepEqual(records, [{ time: '23:59:59.000Z', integer: 2 }]);
  });

  it('assert :: where time (greater than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        time: true
      },
      where: {
        time: {
          gt: '1900-01-01T00:00:00Z'
        }
      }
    });

    deepEqual(records, [
      { time: '00:00:00.000Z', integer: 1 },
      { time: '23:59:59.000Z', integer: 2 }
    ]);
  });

  it('assert :: where time (greater than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        time: true
      },
      where: {
        time: {
          gte: '23:59:59Z'
        }
      }
    });

    deepEqual(records, [{ time: '23:59:59.000Z', integer: 2 }]);
  });

  it('assert :: where time (less than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        time: true
      },
      where: {
        time: {
          lt: '23:59:59Z'
        }
      }
    });

    deepEqual(records, [{ time: '00:00:00.000Z', integer: 1 }]);
  });

  it('assert :: where time (less than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        time: true
      },
      where: {
        time: {
          lte: '2100-01-01T23:59:59Z'
        }
      }
    });

    deepEqual(records, [
      { time: '00:00:00.000Z', integer: 1 },
      { time: '23:59:59.000Z', integer: 2 }
    ]);
  });

  it('assert :: where time (is between)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        time: true
      },
      where: {
        time: {
          isBetween: ['00:00:00Z', '23:59:59Z']
        }
      }
    });

    deepEqual(records, [
      { time: '00:00:00.000Z', integer: 1 },
      { time: '23:59:59.000Z', integer: 2 }
    ]);
  });

  it('assert :: where time (contains)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        time: true
      },
      where: {
        time: {
          contains: '23'
        }
      }
    });

    deepEqual(records, [{ time: '00:00:00.000Z', integer: 1 }]);
  });

  it('assert :: where time (starts with)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        time: true
      },
      where: {
        time: {
          startsWith: '2024-07-01'
        }
      }
    });

    deepEqual(records, [{ time: '23:59:59.000Z', integer: 2 }]);
  });

  it('assert :: where time (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        time: true
      },
      where: {
        NOT: {
          time: '23:59:59Z'
        }
      }
    });

    deepEqual(records, [{ time: '00:00:00.000Z', integer: 1 }]);
  });

  it('assert :: where time (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        time: true
      },
      where: {
        AND: [
          {
            time: '23:59:59Z'
          }
        ]
      }
    });

    deepEqual(records, [{ time: '23:59:59.000Z', integer: 2 }]);
  });

  it('assert :: where time (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        time: true
      },
      where: {
        OR: [
          {
            time: '00:00:00Z'
          },
          {
            time: '23:59:59Z'
          }
        ]
      }
    });

    deepEqual(records, [
      { time: '00:00:00.000Z', integer: 1 },
      { time: '23:59:59.000Z', integer: 2 }
    ]);
  });
});
