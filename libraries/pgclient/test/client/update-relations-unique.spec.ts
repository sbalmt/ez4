import type { AnyObject } from '@ez4/utils';

import { deleteRelationTables, makeRelationClient, prepareRelationTables } from './common/relation';

import { after, beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client update unique relations', async () => {
  const client = await makeRelationClient();

  const primaryId = randomUUID();
  const secondaryId = randomUUID();
  const uniqueId = randomUUID();

  const assertTableCRelations = async (relationId: string, expected: AnyObject) => {
    const { records } = await client.table_c.findMany({
      select: {
        value: true,
        relations: {
          value: true
        },
        relation_unique: {
          value: true
        }
      },
      where: {
        OR: [{ id_c: relationId }, { unique_2_id: relationId }]
      }
    });

    deepEqual(records, [expected]);
  };

  const assertTableARelation2 = async (relationId: string, expected: AnyObject) => {
    const result = await client.table_a.findOne({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      where: {
        id_a: relationId
      }
    });

    deepEqual(result, expected);
  };

  const assertTableBRelation = async (relationId: string, expected: AnyObject) => {
    const result = await client.table_b.findOne({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      where: {
        id_b: relationId
      }
    });

    deepEqual(result, expected);
  };

  const assertTableCRelation = async (relationId: string, expected: AnyObject) => {
    const { records } = await client.table_c.findMany({
      select: {
        value: true,
        relation: {
          value: true
        },
        relation_unique: {
          value: true
        }
      },
      where: {
        OR: [{ id_c: relationId }, { unique_1_id: relationId }]
      }
    });

    deepEqual(records, [expected]);
  };

  const populateTableC = async () => {
    await client.table_c.insertOne({
      data: {
        id_c: primaryId,
        unique_2_id: uniqueId,
        value: 'foo',
        relation: {
          id_b: secondaryId,
          value: 'bar'
        },
        relation_unique: {
          id_b: randomUUID(),
          unique_b: uniqueId,
          value: 'bar'
        },
        relations: [
          {
            id_a: secondaryId,
            value: 'bar'
          }
        ]
      }
    });
  };

  beforeEach(async () => {
    await prepareRelationTables(client);
  });

  after(async () => {
    await deleteRelationTables(client);
  });

  it('assert :: update and select relation (unique to unique)', async () => {
    await populateTableC();

    const result = await client.table_c.updateOne({
      select: {
        value: true,
        relation_unique: {
          value: true
        }
      },
      data: {
        relation_unique: {
          value: 'bar-updated'
        }
      },
      where: {
        id_c: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation_unique: {
        value: 'bar'
      }
    });

    await assertTableBRelation(secondaryId, {
      value: 'bar',
      relation: {
        value: 'foo'
      }
    });
  });

  it('assert :: update and select relation (unique to primary)', async () => {
    await populateTableC();

    const result = await client.table_c.updateOne({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        relation: {
          value: 'bar-updated'
        }
      },
      where: {
        id_c: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation: {
        value: 'bar'
      }
    });

    await assertTableBRelation(secondaryId, {
      value: 'bar-updated',
      relation: {
        value: 'foo'
      }
    });
  });

  it('assert :: update and select relation (unique to secondary)', async () => {
    await populateTableC();

    const result = await client.table_c.updateOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        relations: {
          value: 'bar-connected'
        }
      },
      where: {
        id_c: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relations: [
        {
          value: 'bar'
        }
      ]
    });

    await assertTableARelation2(secondaryId, {
      value: 'bar-connected',
      relation_2: {
        value: 'foo'
      }
    });
  });

  it('assert :: update, connect and select relation (unique to unique)', async () => {
    await populateTableC();

    const targetId = randomUUID();
    const connectionId = randomUUID();

    await client.table_b.insertOne({
      data: {
        id_b: targetId,
        unique_b: connectionId,
        value: 'bar-connected'
      }
    });

    // Connect
    const result = await client.table_c.updateOne({
      select: {
        value: true,
        relation_unique: {
          value: true
        }
      },
      data: {
        relation_unique: {
          unique_b: connectionId
        }
      },
      where: {
        id_c: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation_unique: {
        value: 'bar'
      }
    });

    await assertTableBRelation(targetId, {
      value: 'bar-connected',
      relation: null
    });
  });

  it('assert :: update, connect and select relation (unique to primary)', async () => {
    await populateTableC();

    const connectionId = randomUUID();

    await client.table_b.insertOne({
      data: {
        id_b: connectionId,
        value: 'bar-connected'
      }
    });

    // Connect
    const result = await client.table_c.updateOne({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        relation: {
          id_b: connectionId
        }
      },
      where: {
        id_c: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation: {
        value: 'bar'
      }
    });

    await assertTableBRelation(connectionId, {
      value: 'bar-connected',
      relation: {
        value: 'foo'
      }
    });
  });

  it('assert :: update, connect and select relation (unique to secondary)', async () => {
    await populateTableC();

    const connectionId = randomUUID();

    await client.table_a.insertOne({
      data: {
        id_a: connectionId,
        value: 'bar-connected'
      }
    });

    // Connect
    const result = await client.table_c.updateOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        relations: {
          id_a: connectionId
        }
      },
      where: {
        id_c: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relations: [
        {
          value: 'bar'
        }
      ]
    });

    await assertTableARelation2(connectionId, {
      value: 'bar-connected',
      relation_2: {
        value: 'foo'
      }
    });
  });

  it('assert :: update, disconnect and select relation (unique to unique)', async () => {
    await populateTableC();

    const targetId = randomUUID();
    const connectionId = randomUUID();

    await client.table_b.insertOne({
      data: {
        id_b: targetId,
        unique_b: connectionId,
        value: 'bar-connected'
      }
    });

    // Connect
    const result = await client.table_c.updateOne({
      select: {
        value: true,
        relation_unique: {
          value: true
        }
      },
      data: {
        value: 'foo-updated',
        relation_unique: {
          unique_b: null
        }
      },
      where: {
        id_c: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation_unique: {
        value: 'bar'
      }
    });

    await assertTableCRelation(primaryId, {
      value: 'foo-updated',
      relation_unique: null,
      relation: {
        value: 'bar'
      }
    });

    await assertTableBRelation(secondaryId, {
      value: 'bar',
      relation: {
        value: 'foo-updated'
      }
    });
  });

  it('assert :: update, disconnect and select relation (unique to primary)', async () => {
    await populateTableC();

    const result = await client.table_c.updateOne({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        value: 'foo-updated',
        relation: {
          id_b: null
        }
      },
      where: {
        id_c: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation: {
        value: 'bar'
      }
    });

    await assertTableCRelation(primaryId, {
      value: 'foo-updated',
      relation: null,
      relation_unique: {
        value: 'bar'
      }
    });

    await assertTableBRelation(secondaryId, {
      value: 'bar',
      relation: null
    });
  });

  it('assert :: update, disconnect and select relation (unique to secondary)', async () => {
    await populateTableC();

    const result = await client.table_c.updateOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        value: 'foo-updated',
        relations: {
          id_a: null
        }
      },
      where: {
        id_c: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relations: [
        {
          value: 'bar'
        }
      ]
    });

    await assertTableCRelations(primaryId, {
      value: 'foo-updated',
      relations: [],
      relation_unique: {
        value: 'bar'
      }
    });

    await assertTableARelation2(secondaryId, {
      value: 'bar',
      relation_2: null
    });
  });
});
