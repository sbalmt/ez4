import type { AnyObject } from '@ez4/utils';

import { deleteRelationTables, makeRelationClient, prepareRelationTables } from './common/relation';

import { after, beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client insert secondary relations', async () => {
  const client = await makeRelationClient();

  const assertTableBRelations = async (primaryId: string, expected: AnyObject) => {
    const result = await client.table_b.findOne({
      select: {
        id_b: true,
        value: true,
        relations: {
          id_a: true,
          value: true
        }
      },
      where: {
        id_b: primaryId
      }
    });

    deepEqual(result, expected);
  };

  const assertTableCRelations = async (relationId: string, expected: AnyObject) => {
    const result = await client.table_c.findOne({
      select: {
        id_c: true,
        value: true,
        relations: {
          id_a: true,
          value: true
        }
      },
      where: {
        unique_2_id: relationId
      }
    });

    deepEqual(result, expected);
  };

  beforeEach(async () => {
    await prepareRelationTables(client);
  });

  after(async () => {
    await deleteRelationTables(client);
  });

  it('assert :: insert, create and select relation (secondary to primary)', async () => {
    const sourceId = randomUUID();
    const targetId = randomUUID();

    const result = await client.table_a.insertOne({
      select: {
        id_a: true,
        value: true,
        relation_1: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_a: sourceId,
        value: 'foo',
        relation_1: {
          id_b: targetId,
          value: 'bar'
        }
      }
    });

    deepEqual(result, {
      id_a: sourceId,
      value: 'foo',
      relation_1: {
        id_b: targetId,
        value: 'bar'
      }
    });

    await assertTableBRelations(targetId, {
      id_b: targetId,
      value: 'bar',
      relations: [
        {
          id_a: sourceId,
          value: 'foo'
        }
      ]
    });
  });

  it('assert :: insert, create and select relation (secondary to unique)', async () => {
    const uniqueId = randomUUID();
    const sourceId = randomUUID();
    const targetId = randomUUID();

    const result = await client.table_a.insertOne({
      select: {
        id_a: true,
        value: true,
        relation_2: {
          id_c: true,
          value: true
        }
      },
      data: {
        id_a: sourceId,
        value: 'foo',
        relation_2: {
          id_c: targetId,
          unique_2_id: uniqueId,
          value: 'bar'
        }
      }
    });

    deepEqual(result, {
      id_a: sourceId,
      value: 'foo',
      relation_2: {
        id_c: targetId,
        value: 'bar'
      }
    });

    await assertTableCRelations(uniqueId, {
      id_c: targetId,
      value: 'bar',
      relations: [
        {
          id_a: sourceId,
          value: 'foo'
        }
      ]
    });
  });

  it('assert :: insert, connect and select relation (secondary to primary)', async () => {
    const connectionId = randomUUID();
    const sourceId = randomUUID();

    await client.table_b.insertOne({
      data: {
        id_b: connectionId,
        value: 'bar'
      }
    });

    // Connect
    const result = await client.table_a.insertOne({
      select: {
        id_a: true,
        value: true,
        relation_1: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_a: sourceId,
        value: 'foo',
        relation_1: {
          id_b: connectionId
        }
      }
    });

    deepEqual(result, {
      id_a: sourceId,
      value: 'foo',
      relation_1: {
        id_b: connectionId,
        value: 'bar'
      }
    });

    await assertTableBRelations(connectionId, {
      value: 'bar',
      id_b: connectionId,
      relations: [
        {
          id_a: sourceId,
          value: 'foo'
        }
      ]
    });
  });

  it('assert :: insert, connect and select relation (secondary to unique)', async () => {
    const connectionId = randomUUID();
    const targetId = randomUUID();
    const sourceId = randomUUID();

    await client.table_c.insertOne({
      data: {
        id_c: targetId,
        unique_2_id: connectionId,
        value: 'bar'
      }
    });

    // Connect
    const result = await client.table_a.insertOne({
      select: {
        id_a: true,
        value: true,
        relation_2: {
          id_c: true,
          value: true
        }
      },
      data: {
        id_a: sourceId,
        value: 'foo',
        relation_2: {
          unique_2_id: connectionId
        }
      }
    });

    deepEqual(result, {
      id_a: sourceId,
      value: 'foo',
      relation_2: {
        id_c: targetId,
        value: 'bar'
      }
    });

    await assertTableCRelations(connectionId, {
      id_c: targetId,
      value: 'bar',
      relations: [
        {
          id_a: sourceId,
          value: 'foo'
        }
      ]
    });
  });
});
