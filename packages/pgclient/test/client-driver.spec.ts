import type { Database, Client as DbClient } from '@ez4/database';

import { describe, it, before } from 'node:test';
import { deepEqual } from 'assert/strict';

import { Client } from '@ez4/pgclient';

describe('client driver', () => {
  let client: DbClient<Database.Service>;

  before(async () => {
    client = await Client.make({
      debug: false,
      repository: {},
      connection: {
        database: 'pg',
        password: 'postgres',
        user: 'postgres',
        host: '127.0.0.1'
      }
    });
  });

  it('assert :: raw query', async () => {
    const result = await client.rawQuery('SELECT 1 AS alive');

    deepEqual(result, [{ alive: 1 }]);
  });

  it('assert :: transaction', async () => {
    const result = await client.transaction(async (transaction: DbClient<Database.Service>) => {
      return transaction.rawQuery('SELECT 1 AS alive');
    });

    deepEqual(result, [{ alive: 1 }]);
  });

  it('assert :: transaction (nested)', async () => {
    const result = await client.transaction(async (transaction: DbClient<Database.Service>) => {
      return transaction.transaction(async (innerTransaction: DbClient<Database.Service>) => {
        return innerTransaction.rawQuery('SELECT 1 AS alive');
      });
    });

    deepEqual(result, [{ alive: 1 }]);
  });
});
