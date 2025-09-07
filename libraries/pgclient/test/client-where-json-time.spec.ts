import { makeSchemaClient, prepareSchemaTable } from './common/database';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where json time', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          json: {
            time: '00:00:00Z'
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          json: {
            time: '23:59:59Z'
          }
        }
      ]
    });
  });

  it('assert :: where json time (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          time: '00:00:00Z'
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { time: '00:00:00Z' } }]);
  });

  it('assert :: where json time (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          time: {
            equal: '23:59:59Z'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { time: '23:59:59Z' } }]);
  });

  it('assert :: where json time (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          time: {
            not: '00:00:00Z'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { time: '23:59:59Z' } }]);
  });

  it('assert :: where json time (greater than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          time: {
            gt: '00:00:00Z'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { time: '23:59:59Z' } }]);
  });

  it('assert :: where json time (greater than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          time: {
            gte: '23:59:59Z'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { time: '23:59:59Z' } }]);
  });

  it('assert :: where json time (less than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          time: {
            lt: '23:59:59Z'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { time: '00:00:00Z' } }]);
  });

  it('assert :: where json time (less than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          time: {
            lte: '23:59:59Z'
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { time: '00:00:00Z' } },
      { integer: 2, json: { time: '23:59:59Z' } }
    ]);
  });

  it('assert :: where json time (is between)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          time: {
            isBetween: ['00:00:00Z', '23:59:59Z']
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { time: '00:00:00Z' } },
      { integer: 2, json: { time: '23:59:59Z' } }
    ]);
  });

  it('assert :: where json time (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        NOT: {
          json: {
            time: '23:59:59Z'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { time: '00:00:00Z' } }]);
  });

  it('assert :: where json time (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        AND: [
          {
            json: {
              time: '23:59:59Z'
            }
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 2, json: { time: '23:59:59Z' } }]);
  });

  it('assert :: where json time (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        OR: [
          {
            json: {
              time: '00:00:00Z'
            }
          },
          {
            json: {
              time: '23:59:59Z'
            }
          }
        ]
      }
    });

    deepEqual(records, [
      { integer: 1, json: { time: '00:00:00Z' } },
      { integer: 2, json: { time: '23:59:59Z' } }
    ]);
  });
});
