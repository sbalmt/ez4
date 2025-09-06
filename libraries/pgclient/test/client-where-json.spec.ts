import { makeSchemaClient, prepareSchemaTable } from './common/database';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where json', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          json: {
            foo: 'foo-1',
            bar: false,
            baz: 1
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          json: {
            foo: 'foo-2',
            bar: true,
            baz: 2
          }
        }
      ]
    });
  });

  it('assert :: where json (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          foo: 'foo-1'
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { bar: false, foo: 'foo-1', baz: 1 } }]);
  });

  it('assert :: where json (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          bar: {
            equal: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { bar: true, foo: 'foo-2', baz: 2 } }]);
  });

  it('assert :: where json (compound equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          foo: 'foo-2',
          bar: {
            equal: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { bar: true, foo: 'foo-2', baz: 2 } }]);
  });

  it('assert :: where json (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          foo: {
            not: 'foo-1'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { bar: true, foo: 'foo-2', baz: 2 } }]);
  });

  it('assert :: where json (compound not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          foo: {
            not: 'foo-2'
          },
          bar: {
            not: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { bar: false, foo: 'foo-1', baz: 1 } }]);
  });

  it('assert :: where json (greater than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          baz: {
            gt: -1
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { bar: false, foo: 'foo-1', baz: 1 } },
      { integer: 2, json: { bar: true, foo: 'foo-2', baz: 2 } }
    ]);
  });

  it('assert :: where json (greater than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          baz: {
            gte: 2
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { bar: true, foo: 'foo-2', baz: 2 } }]);
  });

  it('assert :: where json (less than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          baz: {
            lt: 2
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { bar: false, foo: 'foo-1', baz: 1 } }]);
  });

  it('assert :: where json (less than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          baz: {
            lte: 3
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { bar: false, foo: 'foo-1', baz: 1 } },
      { integer: 2, json: { bar: true, foo: 'foo-2', baz: 2 } }
    ]);
  });

  it('assert :: where json (is in)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          baz: {
            isIn: [1, 2]
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { bar: false, foo: 'foo-1', baz: 1 } },
      { integer: 2, json: { bar: true, foo: 'foo-2', baz: 2 } }
    ]);
  });

  it('assert :: where json (is between)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          baz: {
            isBetween: [1, 2]
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { bar: false, foo: 'foo-1', baz: 1 } },
      { integer: 2, json: { bar: true, foo: 'foo-2', baz: 2 } }
    ]);
  });

  it('assert :: where json (contains)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          foo: {
            contains: '-1'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { bar: false, foo: 'foo-1', baz: 1 } }]);
  });

  it('assert :: where json (insensitive contains)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          foo: {
            contains: 'O-2',
            insensitive: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { bar: true, foo: 'foo-2', baz: 2 } }]);
  });

  it('assert :: where json (starts with)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          foo: {
            startsWith: 'fo'
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { bar: false, foo: 'foo-1', baz: 1 } },
      { integer: 2, json: { bar: true, foo: 'foo-2', baz: 2 } }
    ]);
  });

  it('assert :: where json (insensitive starts with)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          foo: {
            startsWith: 'FO',
            insensitive: true
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { bar: false, foo: 'foo-1', baz: 1 } },
      { integer: 2, json: { bar: true, foo: 'foo-2', baz: 2 } }
    ]);
  });

  it('assert :: where json (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        NOT: {
          json: {
            foo: 'foo-2'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { bar: false, foo: 'foo-1', baz: 1 } }]);
  });

  it('assert :: where json (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        AND: [
          {
            json: {
              bar: false
            }
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 1, json: { bar: false, foo: 'foo-1', baz: 1 } }]);
  });

  it('assert :: where json (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        OR: [
          {
            json: {
              bar: false
            }
          },
          {
            json: {
              baz: 2
            }
          }
        ]
      }
    });

    deepEqual(records, [
      { integer: 1, json: { bar: false, foo: 'foo-1', baz: 1 } },
      { integer: 2, json: { bar: true, foo: 'foo-2', baz: 2 } }
    ]);
  });
});
