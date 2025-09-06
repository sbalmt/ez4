import { makeClient, prepareTable } from './common/database';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where null', async () => {
  const client = await makeClient();

  before(async () => {
    await prepareTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          integer: 1
        },
        {
          id: randomUUID(),
          integer: 2
        }
      ]
    });
  });

  it('assert :: where null (implicit)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        string: null
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where null (explicit)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        string: {
          isNull: true
        }
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where not null (explicit)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        integer: {
          isNull: false
        }
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });
});
