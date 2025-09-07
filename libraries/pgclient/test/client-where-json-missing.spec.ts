import { makeSchemaClient, prepareSchemaTable } from './common/database';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where json missing', async () => {
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
        }
      ]
    });
  });

  it('assert :: where json missing', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        json: {
          number: {
            isMissing: true
          }
        }
      }
    });

    deepEqual(records, [{ integer: 1 }]);
  });

  it('assert :: where json not missing', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        json: {
          number: {
            isMissing: false
          }
        }
      }
    });

    deepEqual(records, [{ integer: 2 }]);
  });
});
