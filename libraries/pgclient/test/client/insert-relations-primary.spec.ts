import type { AnyObject } from '@ez4/utils';

import { deleteRelationTables, makeRelationClient, prepareRelationTables } from './common/relation';

import { after, beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client insert primary relations', async () => {
  const client = await makeRelationClient();

  const assertTableARelation1 = async (relationIds: string[], expected: AnyObject[]) => {
    const { records } = await client.table_a.findMany({
      select: {
        id_a: true,
        value: true,
        relation_1: {
          id_b: true,
          value: true
        }
      },
      where: {
        id_a: {
          isIn: relationIds
        }
      }
    });

    deepEqual(records, expected);
  };

  const assertTableCRelation = async (relationId: string, expected: AnyObject) => {
    const { records } = await client.table_c.findMany({
      select: {
        id_c: true,
        value: true,
        relation: {
          id_b: true,
          value: true
        }
      },
      where: {
        OR: [{ id_c: relationId }, { unique_1_id: relationId }]
      }
    });

    deepEqual(records, [expected]);
  };

  beforeEach(async () => {
    await prepareRelationTables(client);
  });

  after(async () => {
    await deleteRelationTables(client);
  });

  it('assert :: insert, create and select relation (primary to secondary)', async () => {
    const targetAId = randomUUID();
    const targetBId = randomUUID();
    const sourceId = randomUUID();

    const result = await client.table_b.insertOne({
      select: {
        id_b: true,
        value: true,
        relations: {
          id_a: true,
          value: true
        }
      },
      data: {
        id_b: sourceId,
        value: 'foo',
        relations: [
          {
            id_a: targetAId,
            value: 'bar'
          },
          {
            id_a: targetBId,
            value: 'baz'
          }
        ]
      }
    });

    deepEqual(result, {
      id_b: sourceId,
      value: 'foo',
      relations: [
        {
          id_a: targetAId,
          value: 'bar'
        },
        {
          id_a: targetBId,
          value: 'baz'
        }
      ]
    });

    await assertTableARelation1(
      [targetAId, targetBId],
      [
        {
          id_a: targetAId,
          value: 'bar',
          relation_1: {
            id_b: sourceId,
            value: 'foo'
          }
        },
        {
          id_a: targetBId,
          value: 'baz',
          relation_1: {
            id_b: sourceId,
            value: 'foo'
          }
        }
      ]
    );
  });

  it('assert :: insert, create and select relation (primary to unique)', async () => {
    const sourceId = randomUUID();
    const targetId = randomUUID();

    const result = await client.table_b.insertOne({
      select: {
        id_b: true,
        value: true,
        relation: {
          id_c: true,
          value: true
        }
      },
      data: {
        id_b: sourceId,
        value: 'foo',
        relation: {
          id_c: targetId,
          value: 'bar'
        }
      }
    });

    deepEqual(result, {
      id_b: sourceId,
      value: 'foo',
      relation: {
        id_c: targetId,
        value: 'bar'
      }
    });

    await assertTableCRelation(targetId, {
      id_c: targetId,
      value: 'bar',
      relation: {
        id_b: sourceId,
        value: 'foo'
      }
    });
  });

  it('assert :: insert, connect and select relation (primary to secondary)', async () => {
    const connectionAId = randomUUID();
    const connectionBId = randomUUID();
    const sourceId = randomUUID();

    await client.table_a.insertMany({
      data: [
        {
          id_a: connectionAId,
          value: 'bar'
        },
        {
          id_a: connectionBId,
          value: 'baz'
        }
      ]
    });

    const result = await client.table_b.insertOne({
      select: {
        id_b: true,
        value: true,
        relations: {
          id_a: true,
          value: true
        }
      },
      data: {
        id_b: sourceId,
        value: 'foo',
        relations: [
          {
            id_a: connectionAId
          },
          {
            id_a: connectionBId
          }
        ]
      }
    });

    deepEqual(result, {
      id_b: sourceId,
      value: 'foo',
      relations: [
        {
          id_a: connectionAId,
          value: 'bar'
        },
        {
          id_a: connectionBId,
          value: 'baz'
        }
      ]
    });

    await assertTableARelation1(
      [connectionAId, connectionBId],
      [
        {
          id_a: connectionAId,
          value: 'bar',
          relation_1: {
            id_b: sourceId,
            value: 'foo'
          }
        },
        {
          id_a: connectionBId,
          value: 'baz',
          relation_1: {
            id_b: sourceId,
            value: 'foo'
          }
        }
      ]
    );
  });

  it('assert :: insert, connect and select relation (primary to unique)', async () => {
    const connectionId = randomUUID();
    const targetId = randomUUID();
    const sourceId = randomUUID();

    await client.table_c.insertOne({
      data: {
        id_c: targetId,
        value: 'bar',
        relation: {
          id_b: connectionId,
          value: 'baz'
        }
      }
    });

    const result = await client.table_b.insertOne({
      select: {
        id_b: true,
        value: true,
        relation: {
          id_c: true,
          value: true
        }
      },
      data: {
        id_b: sourceId,
        value: 'foo',
        relation: {
          unique_1_id: connectionId
        }
      }
    });

    deepEqual(result, {
      id_b: sourceId,
      value: 'foo',
      relation: {
        id_c: targetId,
        value: 'bar'
      }
    });

    await assertTableCRelation(targetId, {
      id_c: targetId,
      value: 'bar',
      relation: {
        id_b: sourceId,
        value: 'foo'
      }
    });
  });
});
