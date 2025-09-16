import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where json datetime', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          json: {
            datetime: '1991-04-23T00:00:00Z'
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          json: {
            datetime: '2024-07-01T23:59:59Z'
          }
        }
      ]
    });
  });

  it('assert :: where json datetime (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          datetime: '1991-04-23T00:00:00Z'
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { datetime: '1991-04-23T00:00:00Z' } }]);
  });

  it('assert :: where json datetime (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          datetime: {
            equal: '2024-07-01T23:59:59Z'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { datetime: '2024-07-01T23:59:59Z' } }]);
  });

  it('assert :: where json datetime (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          datetime: {
            not: '1991-04-23T00:00:00Z'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { datetime: '2024-07-01T23:59:59Z' } }]);
  });

  it('assert :: where json datetime (greater than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          datetime: {
            gt: '1900-01-01T00:00:00Z'
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { datetime: '1991-04-23T00:00:00Z' } },
      { integer: 2, json: { datetime: '2024-07-01T23:59:59Z' } }
    ]);
  });

  it('assert :: where json datetime (greater than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          datetime: {
            gte: '2024-07-01T23:59:59Z'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { datetime: '2024-07-01T23:59:59Z' } }]);
  });

  it('assert :: where json datetime (less than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          datetime: {
            lt: '2024-07-01T23:59:59Z'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { datetime: '1991-04-23T00:00:00Z' } }]);
  });

  it('assert :: where json datetime (less than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          datetime: {
            lte: '2100-01-01T23:59:59Z'
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { datetime: '1991-04-23T00:00:00Z' } },
      { integer: 2, json: { datetime: '2024-07-01T23:59:59Z' } }
    ]);
  });

  it('assert :: where json datetime (is between)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          datetime: {
            isBetween: ['1991-04-23T00:00:00Z', '2024-07-01T23:59:59Z']
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { datetime: '1991-04-23T00:00:00Z' } },
      { integer: 2, json: { datetime: '2024-07-01T23:59:59Z' } }
    ]);
  });

  it('assert :: where json datetime (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        NOT: {
          json: {
            datetime: '2024-07-01T23:59:59Z'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { datetime: '1991-04-23T00:00:00Z' } }]);
  });

  it('assert :: where json datetime (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        AND: [
          {
            json: {
              datetime: '2024-07-01T23:59:59Z'
            }
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 2, json: { datetime: '2024-07-01T23:59:59Z' } }]);
  });

  it('assert :: where json datetime (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        OR: [
          {
            json: {
              datetime: '1991-04-23T00:00:00Z'
            }
          },
          {
            json: {
              datetime: '2024-07-01T23:59:59Z'
            }
          }
        ]
      }
    });

    deepEqual(records, [
      { integer: 1, json: { datetime: '1991-04-23T00:00:00Z' } },
      { integer: 2, json: { datetime: '2024-07-01T23:59:59Z' } }
    ]);
  });
});
