import { makeRelationClient, prepareRelationTables } from './common/relation';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client insert relations', async () => {
  const client = await makeRelationClient();

  const singleResult = {
    value: 'bar',
    relation: {
      value: 'foo'
    }
  };

  const manyResults = {
    value: 'bar',
    relations: [
      {
        value: 'foo'
      }
    ]
  };

  const assertTableARelations = async (...relationIds: string[]) => {
    const { records } = await client.table_a.findMany({
      select: {
        value: true,
        relation_1: {
          value: true
        }
      },
      where: {
        id_a: {
          isIn: relationIds
        }
      }
    });

    deepEqual(records, [
      {
        value: 'bar',
        relation_1: {
          value: 'foo'
        }
      }
      /*
      {
        value: 'baz',
        relation_1: {
          value: 'foo'
        }
      }
      */
    ]);
  };

  const assertTableBRelations = async (primaryId: string) => {
    const result = await client.table_b.findOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      where: {
        id_b: primaryId
      }
    });

    deepEqual(result, manyResults);
  };

  const assertTableCRelations = async (relationId: string) => {
    const result = await client.table_c.findOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      where: {
        unique_2_id: relationId
      }
    });

    deepEqual(result, manyResults);
  };

  const assertTableARelation = async (...relationIds: string[]) => {
    const { records } = await client.table_a.findMany({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      where: {
        id_a: {
          isIn: relationIds
        }
      }
    });

    deepEqual(records, [
      {
        value: 'bar',
        relation_2: {
          value: 'foo'
        }
      }
      /*
      {
        value: 'baz',
        relation_2: {
          value: 'foo'
        }
      }
      */
    ]);
  };

  const assertTableBRelation = async (relationId: string) => {
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

    deepEqual(result, singleResult);
  };

  const assertTableCRelation = async (relationId: string) => {
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

    deepEqual(records, [singleResult]);
  };

  beforeEach(async () => {
    await prepareRelationTables(client);
  });

  it('assert :: insert, create and select relation (secondary to primary)', async () => {
    const primaryId = randomUUID();

    const result = await client.table_a.insertOne({
      select: {
        value: true,
        relation_1: {
          value: true
        }
      },
      data: {
        id_a: randomUUID(),
        value: 'foo',
        relation_1: {
          id_b: primaryId,
          value: 'bar'
        }
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation_1: {
        value: 'bar'
      }
    });

    await assertTableBRelations(primaryId);
  });

  it('assert :: insert, create and select relation (secondary to unique)', async () => {
    const uniqueId = randomUUID();

    const result = await client.table_a.insertOne({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      data: {
        id_a: randomUUID(),
        value: 'foo',
        relation_2: {
          id_c: randomUUID(),
          unique_2_id: uniqueId,
          value: 'bar'
        }
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation_2: {
        value: 'bar'
      }
    });

    await assertTableCRelations(uniqueId);
  });

  it('assert :: insert, create and select relation (primary to secondary)', async () => {
    const secondaryAId = randomUUID();
    const secondaryBId = randomUUID();

    const result = await client.table_b.insertOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        id_b: randomUUID(),
        value: 'foo',
        relations: [
          {
            id_a: secondaryAId,
            value: 'bar'
          }
          /*
          {
            id: secondaryBId,
            value: 'baz'
          }
          */
        ]
      }
    });

    deepEqual(result, {
      value: 'foo',
      relations: [
        {
          value: 'bar'
        }
        /*
        {
          value: 'baz'
        }
        */
      ]
    });

    await assertTableARelations(secondaryAId, secondaryBId);
  });

  it('assert :: insert, create and select relation (primary to unique)', async () => {
    const secondaryId = randomUUID();

    const result = await client.table_b.insertOne({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        id_b: randomUUID(),
        value: 'foo',
        relation: {
          id_c: secondaryId,
          value: 'bar'
        }
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation: {
        value: 'bar'
      }
    });

    await assertTableCRelation(secondaryId);
  });

  it('assert :: insert, create and select relation (unique to primary) ', async () => {
    const primaryId = randomUUID();

    const result = await client.table_c.insertOne({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        id_c: randomUUID(),
        value: 'foo',
        relation: {
          id_b: primaryId,
          value: 'bar'
        }
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation: {
        value: 'bar'
      }
    });

    await assertTableBRelation(primaryId);
  });

  it('assert :: insert, create and select relation (unique to secondary) ', async () => {
    const secondaryAId = randomUUID();
    const secondaryBId = randomUUID();

    const result = await client.table_c.insertOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        id_c: randomUUID(),
        // TODO: Database contract must allow this
        unique_2_id: randomUUID(),
        value: 'foo',
        relations: [
          {
            id_a: secondaryAId,
            value: 'bar'
          }
          /*
          {
            id_a: secondaryBId,
            value: 'baz'
          }
          */
        ]
      }
    });

    deepEqual(result, {
      value: 'foo',
      relations: [
        {
          value: 'bar'
        }
        /*
        {
          value: 'baz'
        }
        */
      ]
    });

    await assertTableARelation(secondaryAId, secondaryBId);
  });

  it('assert :: insert, connect and select relation (secondary to primary)', async () => {
    const primaryId = randomUUID();

    await client.table_b.insertOne({
      data: {
        id_b: primaryId,
        value: 'bar'
      }
    });

    // Connect
    const result = await client.table_a.insertOne({
      select: {
        value: true,
        relation_1: {
          value: true
        }
      },
      data: {
        id_a: randomUUID(),
        value: 'foo',
        relation_1: {
          id_b: primaryId
        }
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation_1: {
        value: 'bar'
      }
    });

    await assertTableBRelations(primaryId);
  });

  it('assert :: insert, connect and select relation (secondary to unique)', async () => {
    const uniqueId = randomUUID();

    await client.table_c.insertOne({
      data: {
        id_c: randomUUID(),
        // TODO: Database contract must allow this
        unique_2_id: uniqueId,
        value: 'bar'
      }
    });

    // Connect
    const result = await client.table_a.insertOne({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      data: {
        id_a: randomUUID(),
        value: 'foo',
        relation_2: {
          id_c: uniqueId
        }
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation_2: {
        value: 'bar'
      }
    });

    await assertTableCRelations(uniqueId);
  });

  it('assert :: insert, connect and select relation (primary to secondary)', async () => {
    const secondaryAId = randomUUID();
    const secondaryBId = randomUUID();

    await client.table_a.insertMany({
      data: [
        {
          id_a: secondaryAId,
          value: 'bar'
        }
        /*
        {
          id: secondaryBId,
          value: 'baz'
        }
        */
      ]
    });

    const result = await client.table_b.insertOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        id_b: randomUUID(),
        value: 'foo',
        relations: [
          {
            id_a: secondaryAId
          }
          /*
          {
            id_a: secondaryBId
          }
          */
        ]
      }
    });

    deepEqual(result, {
      value: 'foo',
      relations: [
        {
          value: 'bar'
        }
        /*
        {
          value: 'baz'
        }
        */
      ]
    });

    await assertTableARelations(secondaryAId, secondaryBId);
  });

  it('assert :: insert, connect and select relation (primary to unique)', async () => {
    const uniqueId = randomUUID();

    await client.table_c.insertOne({
      data: {
        id_c: uniqueId,
        value: 'bar'
      }
    });

    const result = await client.table_b.insertOne({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        id_b: randomUUID(),
        value: 'foo',
        relation: {
          id_c: uniqueId
        }
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation: {
        value: 'bar'
      }
    });

    await assertTableCRelation(uniqueId);
  });

  it('assert :: insert, connect and select relation (unique to primary) ', async () => {
    const primaryId = randomUUID();

    const result = await client.table_c.insertOne({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        id_c: randomUUID(),
        value: 'foo',
        relation: {
          id_b: primaryId,
          value: 'bar'
        }
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation: {
        value: 'bar'
      }
    });

    await assertTableBRelation(primaryId);
  });

  it('assert :: insert, connect and select relation (unique to secondary) ', async () => {
    const secondaryAId = randomUUID();
    const secondaryBId = randomUUID();

    await client.table_a.insertMany({
      data: [
        {
          id_a: secondaryAId,
          value: 'bar'
        }
        /*
        {
          id_a: secondaryBId,
          value: 'baz'
        }
        */
      ]
    });

    const result = await client.table_c.insertOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        id_c: randomUUID(),
        // TODO: Database contract must allow this
        unique_2_id: randomUUID(),
        value: 'foo',
        relations: [
          {
            id_a: secondaryAId
          }
          /*
          {
            id_a: secondaryBId
          }
          */
        ]
      }
    });

    deepEqual(result, {
      value: 'foo',
      relations: [
        {
          value: 'bar'
        }
        /*
        {
          value: 'baz'
        }
        */
      ]
    });

    await assertTableARelation(secondaryAId, secondaryBId);
  });
});
