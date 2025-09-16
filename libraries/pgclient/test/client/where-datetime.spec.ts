import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where datetime', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          datetime: '1991-04-23T00:00:00Z'
        },
        {
          id: randomUUID(),
          integer: 2,
          datetime: '2024-07-01T23:59:59Z'
        }
      ]
    });
  });

  it('assert :: where datetime (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        datetime: true
      },
      where: {
        datetime: '1991-04-23T00:00:00Z'
      }
    });

    deepEqual(records, [{ datetime: '1991-04-23T00:00:00.000Z', integer: 1 }]);
  });

  it('assert :: where datetime (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        datetime: true
      },
      where: {
        datetime: {
          equal: '2024-07-01T23:59:59Z'
        }
      }
    });

    deepEqual(records, [{ datetime: '2024-07-01T23:59:59.000Z', integer: 2 }]);
  });

  it('assert :: where datetime (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        datetime: true
      },
      where: {
        datetime: {
          not: '1991-04-23T00:00:00Z'
        }
      }
    });

    deepEqual(records, [{ datetime: '2024-07-01T23:59:59.000Z', integer: 2 }]);
  });

  it('assert :: where datetime (greater than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        datetime: true
      },
      where: {
        datetime: {
          gt: '1900-01-01T00:00:00Z'
        }
      }
    });

    deepEqual(records, [
      { datetime: '1991-04-23T00:00:00.000Z', integer: 1 },
      { datetime: '2024-07-01T23:59:59.000Z', integer: 2 }
    ]);
  });

  it('assert :: where datetime (greater than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        datetime: true
      },
      where: {
        datetime: {
          gte: '2024-07-01T23:59:59Z'
        }
      }
    });

    deepEqual(records, [{ datetime: '2024-07-01T23:59:59.000Z', integer: 2 }]);
  });

  it('assert :: where datetime (less than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        datetime: true
      },
      where: {
        datetime: {
          lt: '2024-07-01T23:59:59Z'
        }
      }
    });

    deepEqual(records, [{ datetime: '1991-04-23T00:00:00.000Z', integer: 1 }]);
  });

  it('assert :: where datetime (less than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        datetime: true
      },
      where: {
        datetime: {
          lte: '2100-01-01T23:59:59Z'
        }
      }
    });

    deepEqual(records, [
      { datetime: '1991-04-23T00:00:00.000Z', integer: 1 },
      { datetime: '2024-07-01T23:59:59.000Z', integer: 2 }
    ]);
  });

  it('assert :: where datetime (is between)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        datetime: true
      },
      where: {
        datetime: {
          isBetween: ['1991-04-23T00:00:00Z', '2024-07-01T23:59:59Z']
        }
      }
    });

    deepEqual(records, [
      { datetime: '1991-04-23T00:00:00.000Z', integer: 1 },
      { datetime: '2024-07-01T23:59:59.000Z', integer: 2 }
    ]);
  });

  it('assert :: where datetime (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        datetime: true
      },
      where: {
        NOT: {
          datetime: '2024-07-01T23:59:59Z'
        }
      }
    });

    deepEqual(records, [{ datetime: '1991-04-23T00:00:00.000Z', integer: 1 }]);
  });

  it('assert :: where datetime (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        datetime: true
      },
      where: {
        AND: [
          {
            datetime: '2024-07-01T23:59:59Z'
          }
        ]
      }
    });

    deepEqual(records, [{ datetime: '2024-07-01T23:59:59.000Z', integer: 2 }]);
  });

  it('assert :: where datetime (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        datetime: true
      },
      where: {
        OR: [
          {
            datetime: '1991-04-23T00:00:00Z'
          },
          {
            datetime: '2024-07-01T23:59:59Z'
          }
        ]
      }
    });

    deepEqual(records, [
      { datetime: '1991-04-23T00:00:00.000Z', integer: 1 },
      { datetime: '2024-07-01T23:59:59.000Z', integer: 2 }
    ]);
  });
});
