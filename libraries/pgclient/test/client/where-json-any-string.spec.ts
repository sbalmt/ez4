import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { Order } from '@ez4/database';

describe('client where json any string', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          extensible_json: {
            string: 'foo'
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          extensible_json: {
            string: 'bar'
          }
        },
        {
          id: randomUUID(),
          integer: 3,
          extensible_json: {
            string: ''
          }
        },
        {
          id: randomUUID(),
          integer: 4,
          extensible_json: {
            string: '123'
          }
        },
        {
          id: randomUUID(),
          integer: 5,
          extensible_json: {
            string: 123
          }
        }
      ]
    });
  });

  it('assert :: where json any string (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        extensible_json: true
      },
      where: {
        extensible_json: {
          string: 'bar'
        }
      }
    });

    deepEqual(records, [{ integer: 2, extensible_json: { string: 'bar' } }]);
  });

  it('assert :: where json any string (equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          string: {
            equal: 'foo'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1 }]);
  });

  it('assert :: where json any string (empty)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          string: {
            equal: ''
          }
        }
      }
    });

    deepEqual(records, [{ integer: 3 }]);
  });

  it('assert :: where json any string (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          string: {
            not: 'foo'
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 2 }, { integer: 3 }, { integer: 4 }, { integer: 5 }]);
  });

  it('assert :: where json any string (greater than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          string: {
            gt: 'bar',
            lt: 'goo'
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }]);
  });

  it('assert :: where json any string (greater than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          string: {
            gte: 'bar',
            lte: 'foo'
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where json any string (is in preserves types)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          string: {
            isIn: ['123']
          }
        }
      }
    });

    deepEqual(records, [{ integer: 4 }]);
  });

  it('assert :: where json any string (less than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          string: {
            lt: 'foo',
            gte: 'bar'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2 }]);
  });

  it('assert :: where json any string (less than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          string: {
            lte: 'bar',
            gte: 'bar'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2 }]);
  });

  it('assert :: where json any string (is between)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          string: {
            isBetween: ['bar', 'foo']
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where json any string (not in)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        NOT: {
          extensible_json: {
            string: {
              isIn: ['foo', 'bar']
            }
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 3 }, { integer: 4 }, { integer: 5 }]);
  });

  it('assert :: where json any string (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        AND: [
          {
            extensible_json: {
              string: 'foo'
            }
          },
          {
            extensible_json: {
              string: {
                not: 'bar'
              }
            }
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 1 }]);
  });

  it('assert :: where json any string (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        OR: [
          {
            extensible_json: {
              string: 'foo'
            }
          },
          {
            extensible_json: {
              string: 'bar'
            }
          }
        ]
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });
});
