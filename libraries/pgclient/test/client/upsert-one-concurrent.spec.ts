import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { beforeEach, describe, it } from 'node:test';
import { equal } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client concurrently upsert one', async () => {
  const client = await makeSchemaClient();

  const id = randomUUID();

  beforeEach(async () => {
    await prepareSchemaTable(client);
  });

  it('assert :: upsert one (concurrent, no error)', async () => {
    const operations = Array.from({ length: 10 }).map(() => {
      return client.ez4_test_table.upsertOne({
        insert: {
          id,
          string: 'initial',
          integer: 0
        },
        update: {
          string: 'updated'
        },
        where: {
          id
        }
      });
    });

    const results = await Promise.all(operations);

    equal(results.length, 10);
  });
});
