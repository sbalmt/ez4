import type { Database, Client as DbClient } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient';

import { deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { Client } from '@ez4/pgclient/driver';

declare class TestDb extends Database.Service<PostgresEngine> {
  tables: [];
}

describe('client raw driver', () => {
  const client = Client.make<TestDb>({
    debug: false,
    repository: {},
    connection: {
      database: 'postgres',
      password: 'postgres',
      user: 'postgres',
      host: '127.0.0.1'
    }
  });

  it('assert :: raw query', async () => {
    const result = await client.rawQuery('SELECT 1 AS alive');

    deepEqual(result, [{ alive: 1 }]);
  });

  it('assert :: raw query (with named bindings)', async () => {
    const result = await client.rawQuery('SELECT (:foo + :bar + :foo + :baz)::int AS alive', { bar: 2, foo: 1, baz: 4 });

    deepEqual(result, [{ alive: 8 }]);
  });

  it('assert :: raw query (with index bindings)', async () => {
    const result = await client.rawQuery('SELECT (:1 + :0 + :1 + :2)::int AS alive', [1, 2, 3]);

    deepEqual(result, [{ alive: 8 }]);
  });

  it('assert :: transaction', async () => {
    const result = await client.transaction(async (transaction: DbClient<Database.Service<any>>) => {
      return transaction.rawQuery('SELECT 1 AS alive');
    });

    deepEqual(result, [{ alive: 1 }]);
  });

  it('assert :: transaction (nested)', async () => {
    const result = await client.transaction(async (transaction: DbClient<Database.Service<any>>) => {
      return transaction.transaction(async (innerTransaction: DbClient<Database.Service<any>>) => {
        return innerTransaction.rawQuery('SELECT 1 AS alive');
      });
    });

    deepEqual(result, [{ alive: 1 }]);
  });
});

/**
 * A raw query has no table schema, so `parseRecords` never runs and whatever the driver returns is
 * what the caller gets. The Data API driver answers a json column with its text, so this one has to
 * as well — otherwise code written against a local database reads an object, passes, and then reads
 * a string in production, where the usual guards report the value as absent instead of failing.
 */
describe('client raw driver :: json parity with the data api', () => {
  const client = Client.make<TestDb>({
    debug: false,
    repository: {},
    connection: {
      database: 'postgres',
      password: 'postgres',
      user: 'postgres',
      host: '127.0.0.1'
    }
  });

  it('assert :: raw query (json column comes back as text)', async () => {
    const result = await client.rawQuery(`SELECT '{"a":1}'::json AS doc`);

    deepEqual(result, [{ doc: '{"a":1}' }]);
  });

  it('assert :: raw query (jsonb column comes back as text)', async () => {
    const result = await client.rawQuery(`SELECT '{"a":1}'::jsonb AS doc`);

    deepEqual(result, [{ doc: '{"a": 1}' }]);
  });

  it('assert :: raw query (json aggregate comes back as text)', async () => {
    const result = await client.rawQuery(`SELECT jsonb_agg(to_jsonb(t)) AS docs FROM (SELECT 1 AS v) t`);

    deepEqual(result, [{ docs: '[{"v": 1}]' }]);
  });
});
