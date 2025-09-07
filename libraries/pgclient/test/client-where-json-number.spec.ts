import { makeSchemaClient, prepareSchemaTable } from './common/database';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where json number', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          json: {
            number: 1
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          json: {
            number: 1.5
          }
        }
      ]
    });
  });

  it('assert :: where json number (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          number: 1
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { number: 1 } }]);
  });

  it('assert :: where json number (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          number: {
            equal: 1
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { number: 1 } }]);
  });

  it('assert :: where json number (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          number: {
            not: 1
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { number: 1.5 } }]);
  });

  it('assert :: where json number (greater than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          number: {
            gt: 0
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { number: 1 } },
      { integer: 2, json: { number: 1.5 } }
    ]);
  });

  it('assert :: where json number (greater than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          number: {
            gte: 1.5
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { number: 1.5 } }]);
  });

  it('assert :: where json number (less than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          number: {
            lt: 1.5
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { number: 1 } }]);
  });

  it('assert :: where json number (less than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          number: {
            lte: 2
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { number: 1 } },
      { integer: 2, json: { number: 1.5 } }
    ]);
  });

  it('assert :: where json number (is in)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          number: {
            isIn: [1, 2]
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { number: 1 } }]);
  });

  it('assert :: where json number (is between)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          number: {
            isBetween: [1, 2]
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { number: 1 } },
      { integer: 2, json: { number: 1.5 } }
    ]);
  });

  it('assert :: where json number (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        NOT: {
          json: {
            number: 1.5
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { number: 1 } }]);
  });

  it('assert :: where json number (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        AND: [
          {
            json: {
              number: 1.5
            }
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 2, json: { number: 1.5 } }]);
  });

  it('assert :: where json number (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        OR: [
          {
            json: {
              number: 1
            }
          },
          {
            json: {
              number: 1.5
            }
          }
        ]
      }
    });

    deepEqual(records, [
      { integer: 1, json: { number: 1 } },
      { integer: 2, json: { number: 1.5 } }
    ]);
  });
});
