import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where empty', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          string: 'foo'
        },
        {
          id: randomUUID(),
          json: {
            array: ['foo', 'bar', 'baz']
          }
        }
      ]
    });
  });

  it('assert :: where empty string (is in)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        string: true
      },
      where: {
        string: {
          isIn: []
        }
      }
    });

    deepEqual(records, []);
  });

  it('assert :: where empty string (contains)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        string: true
      },
      where: {
        string: {
          contains: ''
        }
      }
    });

    deepEqual(records, [
      {
        string: 'foo'
      }
    ]);
  });

  it('assert :: where empty array (is in)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        json: true
      },
      where: {
        json: {
          array: {
            isIn: []
          }
        }
      }
    });

    deepEqual(records, []);
  });

  it('assert :: where empty array (contains)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        json: true
      },
      where: {
        json: {
          array: {
            contains: []
          }
        }
      }
    });

    deepEqual(records, [
      {
        json: {
          array: ['foo', 'bar', 'baz']
        }
      }
    ]);
  });
});
