import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { Order } from '@ez4/database';

describe('client where json any object', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          extensible_json: {
            object: {
              foo: 'bar',
              number: 1
            }
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          extensible_json: {
            object: {
              foo: 'baz',
              number: 2
            }
          }
        },
        {
          id: randomUUID(),
          integer: 3,
          extensible_json: {
            object: {}
          }
        },
        {
          id: randomUUID(),
          integer: 4,
          extensible_json: {
            object: {
              nested: [
                null,
                false,
                {
                  value: 1
                }
              ]
            }
          }
        }
      ]
    });
  });

  it('assert :: where json any object (nested default)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        extensible_json: true
      },
      where: {
        extensible_json: {
          object: {
            foo: 'bar'
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1, extensible_json: { object: { foo: 'bar', number: 1 } } }]);
  });

  it('assert :: where json any object (equal ignores key order)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          object: {
            equal: {
              number: 1,
              foo: 'bar'
            }
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1 }]);
  });

  it('assert :: where json any object (equal empty)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        extensible_json: true
      },
      where: {
        extensible_json: {
          object: {
            equal: {}
          }
        }
      }
    });

    deepEqual(records, [{ integer: 3, extensible_json: { object: {} } }]);
  });

  it('assert :: where json any object (equal nested values)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true,
        extensible_json: true
      },
      where: {
        extensible_json: {
          object: {
            equal: {
              nested: [
                null,
                false,
                {
                  value: 1
                }
              ]
            }
          }
        }
      }
    });

    deepEqual(records, [{ integer: 4, extensible_json: { object: { nested: [null, false, { value: 1 }] } } }]);
  });

  it('assert :: where json any object (not equal)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          object: {
            not: {}
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }, { integer: 4 }]);
  });

  it('assert :: where json any object (is in)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          object: {
            isIn: [
              {
                foo: 'bar',
                number: 1
              },
              {}
            ]
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 3 }]);
  });

  it('assert :: where json any object (is in is not containment)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          object: {
            isIn: [
              {
                foo: 'bar'
              }
            ]
          }
        }
      }
    });

    deepEqual(records, []);
  });

  it('assert :: where json any object (nested multiple operators)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        extensible_json: {
          object: {
            number: {
              gte: 1,
              lt: 2
            }
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1 }]);
  });

  it('assert :: where json any object (not)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        NOT: {
          extensible_json: {
            object: {
              equal: {}
            }
          }
        }
      },
      order: {
        integer: Order.Asc
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }, { integer: 4 }]);
  });

  it('assert :: where json any object (and)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        AND: [
          {
            extensible_json: {
              object: {
                foo: 'bar'
              }
            }
          },
          {
            extensible_json: {
              object: {
                number: 1
              }
            }
          }
        ]
      }
    });

    deepEqual(records, [{ integer: 1 }]);
  });

  it('assert :: where json any object (or)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        OR: [
          {
            extensible_json: {
              object: {
                equal: {}
              }
            }
          },
          {
            extensible_json: {
              object: {
                foo: 'bar'
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
