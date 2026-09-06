import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DatabaseQueries } from '@ez4/pgmigration/library';

describe('migration database tests', () => {
  it('assert :: create database', () => {
    deepEqual(DatabaseQueries.prepareCreate('database'), {
      check: `SELECT 1 FROM "pg_database" WHERE "datname" = 'database'`,
      query: `CREATE DATABASE "database"`
    });
  });

  it('assert :: delete database', () => {
    deepEqual(DatabaseQueries.prepareDelete('database'), {
      query: `DROP DATABASE IF EXISTS "database" WITH (FORCE)`
    });
  });

  it('assert :: escape database name', () => {
    deepEqual(DatabaseQueries.prepareCreate(`tenant"west`), {
      check: `SELECT 1 FROM "pg_database" WHERE "datname" = 'tenant"west'`,
      query: `CREATE DATABASE "tenant""west"`
    });

    deepEqual(DatabaseQueries.prepareDelete(`tenant"west`), {
      query: `DROP DATABASE IF EXISTS "tenant""west" WITH (FORCE)`
    });
  });
});
