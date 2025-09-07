import { makeSchemaClient, prepareSchemaTable } from './common/database';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where json string', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          json: {
            string: 'foo',
            number: 1
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          json: {
            string: 'bar',
            number: 2
          }
        }
      ]
    });
  });

  it('assert :: where json string (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: 'bar'
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { string: 'bar', number: 2 } }]);
  });

  it('assert :: where json string (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            equal: 'foo'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { string: 'foo', number: 1 } }]);
  });

  it('assert :: where json string (insensitive equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            equal: 'BaR',
            insensitive: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { string: 'bar', number: 2 } }]);
  });

  it('assert :: where json string (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            not: 'foo'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { string: 'bar', number: 2 } }]);
  });

  it('assert :: where json string (insensitive not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            not: 'BAr',
            insensitive: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { string: 'foo', number: 1 } }]);
  });

  it('assert :: where json string (greater than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            gt: 'baq'
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { string: 'foo', number: 1 } },
      { integer: 2, json: { string: 'bar', number: 2 } }
    ]);
  });

  it('assert :: where json string (greater than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            gte: 'fon'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { string: 'foo', number: 1 } }]);
  });

  it('assert :: where json string (less than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            lt: 'foo'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { string: 'bar', number: 2 } }]);
  });

  it('assert :: where json string (less than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            lte: 'foo'
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { string: 'foo', number: 1 } },
      { integer: 2, json: { string: 'bar', number: 2 } }
    ]);
  });

  it('assert :: where json string (is in)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            isIn: ['foo', 'bar']
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { string: 'foo', number: 1 } },
      { integer: 2, json: { string: 'bar', number: 2 } }
    ]);
  });

  it('assert :: where json string (is between)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            isBetween: ['baq', 'fop']
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { string: 'foo', number: 1 } },
      { integer: 2, json: { string: 'bar', number: 2 } }
    ]);
  });

  it('assert :: where json string (contains)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            contains: 'o'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { string: 'foo', number: 1 } }]);
  });

  it('assert :: where json string (insensitive contains)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            contains: 'A',
            insensitive: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { string: 'bar', number: 2 } }]);
  });

  it('assert :: where json string (starts with)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            startsWith: 'ba'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { string: 'bar', number: 2 } }]);
  });

  it('assert :: where json string (insensitive starts with)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            startsWith: 'FO',
            insensitive: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { string: 'foo', number: 1 } }]);
  });

  it('assert :: where json string (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        NOT: {
          json: {
            string: 'bar'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { string: 'foo', number: 1 } }]);
  });

  it('assert :: where json string (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        AND: [
          {
            json: {
              string: 'bar'
            }
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 2, json: { string: 'bar', number: 2 } }]);
  });

  it('assert :: where json string (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        OR: [
          {
            json: {
              string: 'foo'
            }
          },
          {
            json: {
              string: 'bar'
            }
          }
        ]
      }
    });

    deepEqual(records, [
      { integer: 1, json: { string: 'foo', number: 1 } },
      { integer: 2, json: { string: 'bar', number: 2 } }
    ]);
  });
});
