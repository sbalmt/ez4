import { makeSchemaClient, prepareSchemaTable } from './common/database';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client update optional json', async () => {
  const client = await makeSchemaClient();

  const id = randomUUID();

  beforeEach(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertOne({
      data: {
        id
      }
    });
  });

  it('assert :: update with optional parent', async () => {
    const previous = await client.ez4_test_table.updateOne({
      select: {
        json: true
      },
      data: {
        json: {
          foo: 'foo'
        }
      },
      where: {
        id
      }
    });

    deepEqual(previous, { json: null });

    const changes = await client.ez4_test_table.findOne({
      select: {
        json: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      json: {
        foo: 'foo'
      }
    });
  });
});
