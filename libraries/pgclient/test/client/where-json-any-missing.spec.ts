import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { Order } from '@ez4/database';

describe('client where json any missing', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          extensible_json: {
            nested: {}
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          extensible_json: {
            value: null,
            nested: {
              value: null
            }
          }
        },
        {
          id: randomUUID(),
          integer: 3,
          extensible_json: {
            value: false,
            nested: {
              value: 0
            }
          }
        }
      ]
    });
  });

  it('assert :: where json any missing (operator)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          value: {
            isMissing: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1 }]);
  });

  it('assert :: where json any not missing (operator)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          value: {
            isMissing: false
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 2 }, { integer: 3 }]);
  });

  it('assert :: where json any missing (nested)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          nested: {
            value: {
              isMissing: true
            }
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1 }]);
  });

  it('assert :: where json any not missing (nested)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          nested: {
            value: {
              isMissing: false
            }
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 2 }, { integer: 3 }]);
  });

  it('assert :: where json any missing (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        NOT: {
          extensible_json: {
            value: {
              isMissing: false
            }
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1 }]);
  });

  it('assert :: where json any missing (and)', async () => {
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
                equal: false
              }
            }
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 3 }]);
  });

  it('assert :: where json any missing (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        OR: [
          {
            extensible_json: {
              value: {
                isMissing: true
              }
            }
          },
          {
            extensible_json: {
              value: {
                equal: false
              }
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
