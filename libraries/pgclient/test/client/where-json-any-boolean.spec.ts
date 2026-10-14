import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { Order } from '@ez4/database';

describe('client where json any boolean', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          extensible_json: {
            boolean: true
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          extensible_json: {
            boolean: false
          }
        },
        {
          id: randomUUID(),
          integer: 3,
          extensible_json: {
            boolean: 'true'
          }
        }
      ]
    });
  });

  it('assert :: where json any boolean (default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        extensible_json: true
      },
      where: {
        extensible_json: {
          boolean: true
        }
      }
    });

    deepEqual(records, [{ integer: 1, extensible_json: { boolean: true } }]);
  });

  it('assert :: where json any boolean (equal false)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          boolean: {
            equal: false
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2 }]);
  });

  it('assert :: where json any boolean (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          boolean: {
            not: true
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 2 }, { integer: 3 }]);
  });

  it('assert :: where json any boolean (is in preserves types)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          boolean: {
            isIn: [true, false]
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where json any boolean (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        NOT: {
          extensible_json: {
            boolean: {
              isIn: [false, 'true']
            }
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1 }]);
  });

  it('assert :: where json any boolean (mixed membership)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          boolean: {
            isIn: [true, 'true']
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 3 }]);
  });

  it('assert :: where json any boolean (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        AND: [
          {
            extensible_json: {
              boolean: false
            }
          },
          {
            extensible_json: {
              boolean: {
                not: true
              }
            }
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 2 }]);
  });

  it('assert :: where json any boolean (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        OR: [
          {
            extensible_json: {
              boolean: true
            }
          },
          {
            extensible_json: {
              boolean: false
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
