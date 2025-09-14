import type { AnyObject } from '@ez4/utils';

import { makeRelationClient, prepareRelationTables } from './common/relation';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client update relations', async () => {
  const client = await makeRelationClient();

  const primaryId = randomUUID();
  const secondaryId = randomUUID();
  const uniqueId = randomUUID();

  const assertTableBRelations = async (relationId: string, expected: AnyObject) => {
    const result = await client.table_b.findOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      where: {
        id_b: relationId
      }
    });

    deepEqual(result, expected);
  };

  const assertTableCRelations = async (relationId: string, expected: AnyObject) => {
    const { records } = await client.table_c.findMany({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      where: {
        OR: [{ id_c: relationId }, { unique_2_id: relationId }]
      }
    });

    deepEqual(records, [expected]);
  };

  const assertTableARelation1 = async (relationId: string, expected: AnyObject) => {
    const result = await client.table_a.findOne({
      select: {
        value: true,
        relation_1: {
          value: true
        }
      },
      where: {
        id_a: relationId
      }
    });

    deepEqual(result, expected);
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
        }
      },
      where: {
        OR: [{ id_c: relationId }, { unique_1_id: relationId }]
      }
    });

    deepEqual(records, [expected]);
  };

  const populateTableA = async () => {
    await client.table_a.insertOne({
      data: {
        id_a: primaryId,
        value: 'foo',
        relation_1: {
          id_b: secondaryId,
          value: 'bar'
        },
        relation_2: {
          id_c: secondaryId,
          value: 'bar'
        }
      }
    });
  };

  const populateTableB = async () => {
    await client.table_b.insertOne({
      data: {
        id_b: primaryId,
        value: 'foo',
        relations: [
          {
            id_a: secondaryId,
            value: 'bar'
          }
        ],
        relation: {
          id_c: secondaryId,
          value: 'bar'
        }
      }
    });
  };

  const populateTableC = async () => {
    await client.table_c.insertOne({
      data: {
        id_c: primaryId,
        unique_2_id: randomUUID(),
        value: 'foo',
        relation: {
          id_b: secondaryId,
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

  it('assert :: update and select relation (secondary to primary)', async () => {
    await populateTableA();

    const result = await client.table_a.updateOne({
      select: {
        value: true,
        relation_1: {
          value: true
        }
      },
      data: {
        relation_1: {
          value: 'bar-updated'
        }
      },
      where: {
        id_a: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation_1: {
        value: 'bar'
      }
    });

    assertTableBRelations(secondaryId, {
      value: 'bar-updated',
      relations: [
        {
          value: 'foo'
        }
      ]
    });
  });

  it('assert :: update and select relation (secondary to unique)', async () => {
    await populateTableA();

    const result = await client.table_a.updateOne({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      data: {
        relation_2: {
          value: 'bar-updated'
        }
      },
      where: {
        id_a: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation_2: {
        value: 'bar'
      }
    });

    await assertTableCRelations(uniqueId, {
      value: 'bar-updated',
      relations: [
        {
          value: 'foo'
        }
      ]
    });
  });

  it('assert :: update and select relation (primary to secondary)', async () => {
    await populateTableB();

    const result = await client.table_b.updateOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        relations: {
          value: 'bar-updated'
        }
      },
      where: {
        id_b: primaryId
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

    await assertTableARelation1(secondaryId, {
      value: 'bar-updated',
      relation_1: {
        value: 'foo'
      }
    });
  });

  it('assert :: update and select relation (primary to unique)', async () => {
    await populateTableB();

    const result = await client.table_b.updateOne({
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
        id_b: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation: {
        value: 'bar'
      }
    });

    await assertTableCRelation(secondaryId, {
      value: 'bar-updated',
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

  it('assert :: update, connect and select relation (secondary to primary)', async () => {
    await populateTableA();

    const connectionId = randomUUID();

    await client.table_b.insertOne({
      data: {
        id_b: connectionId,
        value: 'bar-connected'
      }
    });

    // Connect
    const result = await client.table_a.updateOne({
      select: {
        value: true,
        relation_1: {
          value: true
        }
      },
      data: {
        relation_1: {
          id_b: connectionId
        }
      },
      where: {
        id_a: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation_1: {
        value: 'bar'
      }
    });

    await assertTableBRelations(connectionId, {
      value: 'bar-connected',
      relations: [
        {
          value: 'foo'
        }
      ]
    });
  });

  it('assert :: update, connect and select relation (secondary to unique)', async () => {
    await populateTableA();

    const connectionId = randomUUID();

    await client.table_c.insertOne({
      data: {
        id_c: randomUUID(),
        unique_2_id: connectionId,
        value: 'bar-connected'
      }
    });

    // Connect
    const result = await client.table_a.updateOne({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      data: {
        relation_2: {
          id_c: connectionId
        }
      },
      where: {
        id_a: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation_2: {
        value: 'bar'
      }
    });

    await assertTableCRelations(connectionId, {
      value: 'bar-connected',
      relations: [
        {
          value: 'foo'
        }
      ]
    });
  });

  it('assert :: update, connect and select relation (primary to secondary)', async () => {
    await populateTableB();

    const connectionId = randomUUID();

    await client.table_a.insertOne({
      data: {
        id_a: connectionId,
        value: 'bar-updated'
      }
    });

    // Connect
    const result = await client.table_b.updateOne({
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
        id_b: primaryId
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

    await assertTableARelation1(connectionId, {
      value: 'bar-updated',
      relation_1: {
        value: 'foo'
      }
    });
  });

  it('assert :: update, connect and select relation (primary to unique)', async () => {
    await populateTableB();

    const connectionId = randomUUID();

    await client.table_c.insertOne({
      data: {
        id_c: connectionId,
        value: 'bar-connected'
      }
    });

    // Connect
    const result = await client.table_b.updateOne({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        relation: {
          id_c: connectionId
        }
      },
      where: {
        id_b: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation: {
        value: 'bar'
      }
    });

    await assertTableCRelation(connectionId, {
      value: 'bar-connected',
      relation: {
        value: 'foo'
      }
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

  it('assert :: update, disconnect and select relation (secondary to primary)', async () => {
    await populateTableA();

    const result = await client.table_a.updateOne({
      select: {
        value: true,
        relation_1: {
          value: true
        }
      },
      data: {
        value: 'foo-updated',
        relation_1: {
          id_b: null
        }
      },
      where: {
        id_a: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation_1: {
        value: 'bar'
      }
    });

    await assertTableARelation1(primaryId, {
      value: 'foo-updated',
      relation_1: null
    });

    await assertTableBRelations(secondaryId, {
      value: 'bar',
      relations: []
    });
  });

  it('assert :: update, disconnect and select relation (secondary to unique)', async () => {
    await populateTableA();

    const result = await client.table_a.updateOne({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      data: {
        value: 'foo-updated',
        relation_2: {
          id_c: null
        }
      },
      where: {
        id_a: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation_2: {
        value: 'bar'
      }
    });

    assertTableARelation2(primaryId, {
      value: 'foo-updated',
      relation_2: null
    });

    await assertTableCRelations(uniqueId, {
      value: 'bar',
      relations: []
    });
  });

  it('assert :: update, disconnect and select relation (primary to secondary)', async () => {
    await populateTableB();

    const result = await client.table_b.updateOne({
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
        id_b: primaryId
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

    await assertTableBRelations(primaryId, {
      value: 'foo-updated',
      relations: []
    });

    await assertTableARelation1(secondaryId, {
      value: 'bar',
      relation_1: null
    });
  });

  it('assert :: update, disconnect and select relation (primary to unique)', async () => {
    await populateTableB();

    const result = await client.table_b.updateOne({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        value: 'foo-updated',
        relation: {
          id_c: null
        }
      },
      where: {
        id_b: primaryId
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation: {
        value: 'bar'
      }
    });

    await assertTableBRelation(primaryId, {
      value: 'foo-updated',
      relation: null
    });

    await assertTableCRelation(secondaryId, {
      value: 'bar',
      relation: null
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
      relation: null
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
      relations: []
    });

    await assertTableARelation2(secondaryId, {
      value: 'bar',
      relation_2: null
    });
  });
});
