import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { Order } from '@ez4/database';

describe('client where json any array', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          extensible_json: {
            array: [1, 2, 3]
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          extensible_json: {
            array: [
              1,
              'foo',
              false,
              null,
              {
                value: 2
              }
            ]
          }
        },
        {
          id: randomUUID(),
          integer: 3,
          extensible_json: {
            array: []
          }
        },
        {
          id: randomUUID(),
          integer: 4,
          extensible_json: {
            array: [3, 2, 1]
          }
        }
      ]
    });
  });

  it('assert :: where json any array (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        extensible_json: true
      },
      where: {
        extensible_json: {
          array: [1, 2, 3]
        }
      }
    });

    deepEqual(records, [{ integer: 1, extensible_json: { array: [1, 2, 3] } }]);
  });

  it('assert :: where json any array (equal mixed types)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        extensible_json: true
      },
      where: {
        extensible_json: {
          array: {
            equal: [
              1,
              'foo',
              false,
              null,
              {
                value: 2
              }
            ]
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, extensible_json: { array: [1, 'foo', false, null, { value: 2 }] } }]);
  });

  it('assert :: where json any array (equal empty)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          array: {
            equal: []
          }
        }
      }
    });

    deepEqual(records, [{ integer: 3 }]);
  });

  it('assert :: where json any array (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          array: {
            not: [1, 2, 3]
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 2 }, { integer: 3 }, { integer: 4 }]);
  });

  it('assert :: where json any array (is in exact values)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          array: {
            isIn: [[1, 2, 3], []]
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 3 }]);
  });

  it('assert :: where json any array (is in is not containment)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          array: {
            isIn: [[1, 2, 3, 4]]
          }
        }
      }
    });

    deepEqual(records, []);
  });

  it('assert :: where json any array (empty membership)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          array: {
            isIn: []
          }
        }
      }
    });

    deepEqual(records, []);
  });

  it('assert :: where json any array (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        NOT: {
          extensible_json: {
            array: []
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }, { integer: 4 }]);
  });

  it('assert :: where json any array (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        AND: [
          {
            extensible_json: {
              array: [1, 2, 3]
            }
          },
          {
            extensible_json: {
              array: {
                not: []
              }
            }
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 1 }]);
  });

  it('assert :: where json any array (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        OR: [
          {
            extensible_json: {
              array: [1, 2, 3]
            }
          },
          {
            extensible_json: {
              array: []
            }
          }
        ]
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 3 }]);
  });
});
