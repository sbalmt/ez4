import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { Order } from '@ez4/database';

describe('client where json any number', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          extensible_json: {
            number: -1.25,
            nested: {
              value: 1
            }
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          extensible_json: {
            number: 0,
            nested: {
              value: 2
            }
          }
        },
        {
          id: randomUUID(),
          integer: 3,
          extensible_json: {
            number: 123,
            nested: {
              value: 3
            }
          }
        },
        {
          id: randomUUID(),
          integer: 4,
          extensible_json: {
            number: '123'
          }
        }
      ]
    });
  });

  it('assert :: where json any number (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        extensible_json: true
      },
      where: {
        extensible_json: {
          number: -1.25
        }
      }
    });

    deepEqual(records, [{ integer: 1, extensible_json: { number: -1.25, nested: { value: 1 } } }]);
  });

  it('assert :: where json any number (equal zero)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          number: {
            equal: 0
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2 }]);
  });

  it('assert :: where json any number (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          number: {
            not: 123
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }, { integer: 4 }]);
  });

  it('assert :: where json any number (greater than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          number: {
            gt: 0
          }
        }
      }
    });

    deepEqual(records, [{ integer: 3 }]);
  });

  it('assert :: where json any number (greater than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          number: {
            gte: 0
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 2 }, { integer: 3 }]);
  });

  it('assert :: where json any number (less than)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          number: {
            lt: 0,
            gte: -2
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1 }]);
  });

  it('assert :: where json any number (less than or equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          number: {
            lte: 0,
            gte: -2
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where json any number (is in preserves types)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          number: {
            isIn: [123, -1.25]
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 3 }]);
  });

  it('assert :: where json any number (is between)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          number: {
            isBetween: [-1.25, 0]
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where json any number (nested multiple operators)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          nested: {
            value: {
              gte: 1,
              lt: 3
            }
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where json any number (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        NOT: {
          extensible_json: {
            number: {
              isIn: [0, '123']
            }
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 3 }]);
  });

  it('assert :: where json any number (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        AND: [
          {
            extensible_json: {
              number: {
                gte: 0
              }
            }
          },
          {
            extensible_json: {
              number: {
                lt: 123
              }
            }
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 2 }]);
  });

  it('assert :: where json any number (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        OR: [
          {
            extensible_json: {
              number: 0
            }
          },
          {
            extensible_json: {
              number: 123
            }
          }
        ]
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 2 }, { integer: 3 }]);
  });
});
