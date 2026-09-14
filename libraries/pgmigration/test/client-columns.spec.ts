import type { PgTableRepository } from '@ez4/pgclient/library';
import type { ObjectSchemaProperty } from '@ez4/schema';

import { afterEach, beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getCreateQueries, getDeleteQueries, getUpdateStepQueries } from '@ez4/pgmigration';
import { Client } from '@ez4/pgclient/driver';
import { SchemaType } from '@ez4/schema';

import { columnMetadata } from './common/queries';
import { runMigration } from './common/migration';

describe('migration :: client columns tests', () => {
  const client = Client.make({
    debug: false,
    repository: {},
    connection: {
      database: 'postgres',
      password: 'postgres',
      user: 'postgres',
      host: '127.0.0.1'
    }
  });

  const identifier = '00000000-0000-4000-8000-000000000001';

  const repository: PgTableRepository = {
    column_changes: {
      name: 'column_changes',
      indexes: {},
      relations: {},
      schema: {
        type: SchemaType.Object,
        properties: {
          amount: {
            type: SchemaType.Number,
            format: 'integer'
          },
          identifier: {
            type: SchemaType.String
          },
          label: {
            type: SchemaType.String,
            definitions: {
              maxLength: 20
            }
          },
          optional: {
            type: SchemaType.String
          },
          required: {
            type: SchemaType.String,
            optional: true
          },
          default_added: {
            type: SchemaType.String,
            definitions: {
              maxLength: 20
            }
          },
          default_removed: {
            type: SchemaType.String,
            definitions: {
              maxLength: 20,
              default: 'old'
            }
          }
        }
      }
    }
  };

  beforeEach(async () => {
    await runMigration(client, getCreateQueries(repository));

    await client.rawQuery(`INSERT INTO "column_changes" VALUES (1, '${identifier}', 'label', 'optional', 'required', 'kept', DEFAULT)`);
  });

  afterEach(async () => {
    await runMigration(client, getDeleteQueries(repository));
  });

  const migrateColumn = async (column: string, schema: ObjectSchemaProperty) => {
    const table = repository.column_changes;

    const targetRepository: PgTableRepository = {
      column_changes: {
        ...table,
        schema: {
          ...table.schema,
          properties: {
            ...table.schema.properties,
            [column]: schema
          }
        }
      }
    };

    const steps = getUpdateStepQueries(targetRepository, repository);

    await runMigration(client, steps.prepare);
    await runMigration(client, steps.rollout);
    await runMigration(client, steps.cleanup);
  };

  it('assert :: migrate integer column to decimal', async () => {
    await migrateColumn('amount', { type: SchemaType.Number });

    const columns = await columnMetadata(client, 'column_changes', 'amount');

    deepEqual(columns, [
      {
        column_name: 'amount',
        data_type: 'numeric',
        character_maximum_length: null,
        is_nullable: 'NO',
        column_default: null
      }
    ]);

    const rows = await client.rawQuery('SELECT "amount"::text FROM "column_changes"');

    deepEqual(rows, [
      {
        amount: '1'
      }
    ]);

    const inserted = await client.rawQuery(
      `INSERT INTO "column_changes" SELECT 1.5, identifier, label, optional, required, default_added, default_removed ` +
        `FROM "column_changes" RETURNING "amount"::text`
    );

    deepEqual(inserted, [
      {
        amount: '1.5'
      }
    ]);
  });

  it('assert :: migrate text column to uuid', async () => {
    await migrateColumn('identifier', { type: SchemaType.String, format: 'uuid' });

    const columns = await columnMetadata(client, 'column_changes', 'identifier');

    deepEqual(columns, [
      {
        column_name: 'identifier',
        data_type: 'uuid',
        character_maximum_length: null,
        is_nullable: 'NO',
        column_default: null
      }
    ]);

    const rows = await client.rawQuery('SELECT "identifier" FROM "column_changes"');

    deepEqual(rows, [
      {
        identifier
      }
    ]);
  });

  it('assert :: increase column maximum length', async () => {
    await migrateColumn('label', {
      type: SchemaType.String,
      definitions: {
        maxLength: 100
      }
    });

    const columns = await columnMetadata(client, 'column_changes', 'label');

    deepEqual(columns, [
      {
        column_name: 'label',
        data_type: 'character varying',
        character_maximum_length: 100,
        is_nullable: 'NO',
        column_default: null
      }
    ]);

    const rows = await client.rawQuery('SELECT "label" FROM "column_changes"');

    deepEqual(rows, [
      {
        label: 'label'
      }
    ]);

    const label = 'label'.repeat(10);

    const inserted = await client.rawQuery(
      `INSERT INTO "column_changes" SELECT amount, identifier, '${label}', optional, required, default_added, default_removed ` +
        `FROM "column_changes" RETURNING "label"`
    );

    deepEqual(inserted, [
      {
        label
      }
    ]);
  });

  it('assert :: make column optional', async () => {
    await migrateColumn('optional', { type: SchemaType.String, optional: true });

    const columns = await columnMetadata(client, 'column_changes', 'optional');

    deepEqual(columns, [
      {
        column_name: 'optional',
        data_type: 'text',
        character_maximum_length: null,
        is_nullable: 'YES',
        column_default: null
      }
    ]);

    const rows = await client.rawQuery('SELECT "optional" FROM "column_changes"');

    deepEqual(rows, [{ optional: 'optional' }]);

    const inserted = await client.rawQuery(
      `INSERT INTO "column_changes" (amount, identifier, label, required, default_added, default_removed) ` +
        `SELECT amount, identifier, label, required, default_added, default_removed FROM "column_changes" RETURNING "optional"`
    );

    deepEqual(inserted, [
      {
        optional: null
      }
    ]);
  });

  it('assert :: make column required', async () => {
    await migrateColumn('required', { type: SchemaType.String });

    const columns = await columnMetadata(client, 'column_changes', 'required');

    deepEqual(columns, [
      {
        column_name: 'required',
        data_type: 'text',
        character_maximum_length: null,
        is_nullable: 'NO',
        column_default: null
      }
    ]);

    const rows = await client.rawQuery('SELECT "required" FROM "column_changes"');

    deepEqual(rows, [
      {
        required: 'required'
      }
    ]);
  });

  it('assert :: add column default within existing definitions', async () => {
    await migrateColumn('default_added', { type: SchemaType.String, definitions: { maxLength: 20, default: 'new' } });

    const columns = await columnMetadata(client, 'column_changes', 'default_added');

    deepEqual(columns, [
      {
        column_name: 'default_added',
        data_type: 'character varying',
        character_maximum_length: 20,
        is_nullable: 'NO',
        column_default: "'new'::character varying"
      }
    ]);

    const rows = await client.rawQuery('SELECT "default_added" FROM "column_changes"');

    deepEqual(rows, [
      {
        default_added: 'kept'
      }
    ]);

    const inserted = await client.rawQuery(
      `INSERT INTO "column_changes" (amount, identifier, label, optional, required, default_removed) ` +
        `SELECT amount, identifier, label, optional, required, default_removed FROM "column_changes" RETURNING "default_added"`
    );

    deepEqual(inserted, [
      {
        default_added: 'new'
      }
    ]);
  });

  it('assert :: remove column default from existing definitions', async () => {
    await migrateColumn('default_removed', { type: SchemaType.String, definitions: { maxLength: 20 } });

    const columns = await columnMetadata(client, 'column_changes', 'default_removed');

    deepEqual(columns, [
      {
        column_name: 'default_removed',
        data_type: 'character varying',
        character_maximum_length: 20,
        is_nullable: 'NO',
        column_default: null
      }
    ]);

    const rows = await client.rawQuery('SELECT "default_removed" FROM "column_changes"');

    deepEqual(rows, [
      {
        default_removed: 'old'
      }
    ]);
  });
});
