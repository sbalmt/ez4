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
            boolean: false,
            string: 'foo-1',
            number: 1
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          json: {
            boolean: true,
            string: 'foo-2',
            number: 2
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
          string: 'foo-1'
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { boolean: false, string: 'foo-1', number: 1 } }]);
  });

  it('assert :: where json (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          boolean: {
            equal: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { boolean: true, string: 'foo-2', number: 2 } }]);
  });

  it('assert :: where json (compound equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: 'foo-2',
          boolean: {
            equal: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { boolean: true, string: 'foo-2', number: 2 } }]);
  });

  it('assert :: where json (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            not: 'foo-1'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { boolean: true, string: 'foo-2', number: 2 } }]);
  });

  it('assert :: where json (compound not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            not: 'foo-2'
          },
          boolean: {
            not: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { boolean: false, string: 'foo-1', number: 1 } }]);
  });

  it('assert :: where json (greater than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          number: {
            gt: -1
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { boolean: false, string: 'foo-1', number: 1 } },
      { integer: 2, json: { boolean: true, string: 'foo-2', number: 2 } }
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
          number: {
            gte: 2
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { boolean: true, string: 'foo-2', number: 2 } }]);
  });

  it('assert :: where json (less than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          number: {
            lt: 2
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { boolean: false, string: 'foo-1', number: 1 } }]);
  });

  it('assert :: where json (less than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          number: {
            lte: 3
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { boolean: false, string: 'foo-1', number: 1 } },
      { integer: 2, json: { boolean: true, string: 'foo-2', number: 2 } }
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
          number: {
            isIn: [1, 2]
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { boolean: false, string: 'foo-1', number: 1 } },
      { integer: 2, json: { boolean: true, string: 'foo-2', number: 2 } }
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
          number: {
            isBetween: [1, 2]
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { boolean: false, string: 'foo-1', number: 1 } },
      { integer: 2, json: { boolean: true, string: 'foo-2', number: 2 } }
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
          string: {
            contains: '-1'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { boolean: false, string: 'foo-1', number: 1 } }]);
  });

  it('assert :: where json (insensitive contains)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            contains: 'O-2',
            insensitive: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, json: { boolean: true, string: 'foo-2', number: 2 } }]);
  });

  it('assert :: where json (starts with)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        json: true
      },
      where: {
        json: {
          string: {
            startsWith: 'fo'
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { boolean: false, string: 'foo-1', number: 1 } },
      { integer: 2, json: { boolean: true, string: 'foo-2', number: 2 } }
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
          string: {
            startsWith: 'FO',
            insensitive: true
          }
        }
      }
    });

    deepEqual(records, [
      { integer: 1, json: { boolean: false, string: 'foo-1', number: 1 } },
      { integer: 2, json: { boolean: true, string: 'foo-2', number: 2 } }
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
            string: 'foo-2'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, json: { boolean: false, string: 'foo-1', number: 1 } }]);
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
              boolean: false
            }
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 1, json: { boolean: false, string: 'foo-1', number: 1 } }]);
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
              boolean: false
            }
          },
          {
            json: {
              number: 2
            }
          }
        ]
      }
    });

    deepEqual(records, [
      { integer: 1, json: { boolean: false, string: 'foo-1', number: 1 } },
      { integer: 2, json: { boolean: true, string: 'foo-2', number: 2 } }
    ]);
  });
});
