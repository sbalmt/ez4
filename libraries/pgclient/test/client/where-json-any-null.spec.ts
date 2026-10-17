import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { Order } from '@ez4/database';

describe('client where json any null', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          extensible_json: {}
        },
        {
          id: randomUUID(),
          integer: 2,
          extensible_json: {
            value: null
          }
        },
        {
          id: randomUUID(),
          integer: 3,
          extensible_json: {
            value: 0
          }
        },
        {
          id: randomUUID(),
          integer: 4,
          extensible_json: {
            other: true
          }
        }
      ]
    });
  });

  it('assert :: where json any null (implicit SQL null)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          value: null
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 4 }]);
  });

  it('assert :: where json any null (explicit SQL null)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          value: {
            equal: null
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 4 }]);
  });

  it('assert :: where json any null (operator)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          value: {
            isNull: true
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 4 }]);
  });

  it('assert :: where json any not null (explicit)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          value: {
            not: null
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 2 }, { integer: 3 }]);
  });

  it('assert :: where json any not null (operator)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          value: {
            isNull: false
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 2 }, { integer: 3 }]);
  });

  it('assert :: where json any null (JSON null membership)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        extensible_json: true
      },
      where: {
        extensible_json: {
          value: {
            isIn: [null]
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2, extensible_json: { value: null } }]);
  });

  it('assert :: where json any null (mixed membership)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          value: {
            isIn: [null, 0]
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 2 }, { integer: 3 }]);
  });

  it('assert :: where json any null (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        NOT: {
          extensible_json: {
            value: {
              isIn: [null]
            }
          }
        }
      }
    });

    deepEqual(records, [{ integer: 3 }]);
  });

  it('assert :: where json any null (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        AND: [
          {
            extensible_json: {
              value: {
                isMissing: false
              }
            }
          },
          {
            extensible_json: {
              value: {
                isIn: [null]
              }
            }
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 2 }]);
  });

  it('assert :: where json any null (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        OR: [
          {
            extensible_json: {
              value: {
                isIn: [null]
              }
            }
          },
          {
            extensible_json: {
              value: {
                equal: 0
              }
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
