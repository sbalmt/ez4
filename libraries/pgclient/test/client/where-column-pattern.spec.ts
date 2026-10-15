import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where column pattern', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          string: 'user_name'
        },
        {
          id: randomUUID(),
          string: 'username'
        },
        {
          id: randomUUID(),
          string: '100% cotton'
        },
        {
          id: randomUUID(),
          string: '1000 pieces'
        },
        {
          id: randomUUID(),
          string: 'C:\\Temp'
        },
        {
          id: randomUUID(),
          string: 'C:Temp'
        }
      ]
    });
  });

  it('assert :: where column pattern (contains underscore)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        string: true
      },
      where: {
        string: {
          contains: 'r_n'
        }
      }
    });

    deepEqual(records, [
      {
        string: 'user_name'
      }
    ]);
  });

  it('assert :: where column pattern (starts with percent)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        string: true
      },
      where: {
        string: {
          startsWith: '100%'
        }
      }
    });

    deepEqual(records, [
      {
        string: '100% cotton'
      }
    ]);
  });

  it('assert :: where column pattern (contains backslash)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        string: true
      },
      where: {
        string: {
          contains: ':\\t',
          insensitive: true
        }
      }
    });

    deepEqual(records, [
      {
        string: 'C:\\Temp'
      }
    ]);
  });
});
