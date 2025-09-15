import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where json null', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1,
          json: {
            boolean: true,
            string: 'foo-1'
          }
        },
        {
          id: randomUUID(),
          integer: 2,
          json: {
            boolean: true,
            string: 'foo-2',
            number: null
          }
        },
        {
          id: randomUUID(),
          integer: 3,
          json: {
            boolean: true,
            string: 'foo-3',
            number: 3
          }
        }
      ]
    });
  });

  it('assert :: where json null (implicit)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        json: {
          number: null
        }
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where json null (explicit)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        json: {
          number: {
            equal: null
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where json null (operator)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        json: {
          number: {
            isNull: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where json not null (explicit)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        json: {
          number: {
            not: null
          }
        }
      }
    });

    deepEqual(records, [{ integer: 3 }]);
  });

  it('assert :: where json not null (operator)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        json: {
          number: {
            isNull: false
          }
        }
      }
    });

    deepEqual(records, [{ integer: 3 }]);
  });
});
