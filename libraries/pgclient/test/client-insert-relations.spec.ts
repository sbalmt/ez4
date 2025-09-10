import type { AnyObject } from '@ez4/utils';

import { makeRelationClient, prepareRelationTables } from './common/relation';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client insert relations', async () => {
  const client = await makeRelationClient();

  const assertTableBRelations = async (primaryId: string, expected: AnyObject) => {
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

    deepEqual(result, expected);
  };

  const assertTableCRelations = async (relationId: string, expected: AnyObject) => {
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

    deepEqual(result, expected);
  };

  const assertTableARelation1 = async (relationIds: string[], expected: AnyObject[]) => {
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

    deepEqual(records, expected);
  };

  const assertTableARelation2 = async (relationIds: string[], expected: AnyObject[]) => {
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

    deepEqual(records, expected);
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

    await assertTableBRelations(primaryId, {
      value: 'bar',
      relations: [
        {
          value: 'foo'
        }
      ]
    });
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

    await assertTableCRelations(uniqueId, {
      value: 'bar',
      relations: [
        {
          value: 'foo'
        }
      ]
    });
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

    await assertTableARelation1(
      [secondaryAId, secondaryBId],
      [
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
      ]
    );
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

    await assertTableCRelation(secondaryId, {
      value: 'bar',
      relation: {
        value: 'foo'
      }
    });
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

    await assertTableBRelation(primaryId, {
      value: 'bar',
      relation: {
        value: 'foo'
      }
    });
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

    await assertTableARelation2(
      [secondaryAId, secondaryBId],
      [
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
      ]
    );
  });

  it('assert :: insert, connect and select relation (secondary to primary)', async () => {
    const connectionId = randomUUID();

    await client.table_b.insertOne({
      data: {
        id_b: connectionId,
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
          id_b: connectionId
        }
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation_1: {
        value: 'bar'
      }
    });

    await assertTableBRelations(connectionId, {
      value: 'bar',
      relations: [
        {
          value: 'foo'
        }
      ]
    });
  });

  it('assert :: insert, connect and select relation (secondary to unique)', async () => {
    const connectionId = randomUUID();

    await client.table_c.insertOne({
      data: {
        id_c: randomUUID(),
        // TODO: Database contract must allow this
        unique_2_id: connectionId,
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
          id_c: connectionId
        }
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation_2: {
        value: 'bar'
      }
    });

    await assertTableCRelations(connectionId, {
      value: 'bar',
      relations: [
        {
          value: 'foo'
        }
      ]
    });
  });

  it('assert :: insert, connect and select relation (primary to secondary)', async () => {
    const connectionAId = randomUUID();
    const connectionBId = randomUUID();

    await client.table_a.insertMany({
      data: [
        {
          id_a: connectionAId,
          value: 'bar'
        }
        /*
        {
          id: connectionBId,
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
            id_a: connectionAId
          }
          /*
          {
            id_a: connectionBId
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

    await assertTableARelation1(
      [connectionAId, connectionBId],
      [
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
      ]
    );
  });

  it('assert :: insert, connect and select relation (primary to unique)', async () => {
    const connectionId = randomUUID();

    await client.table_c.insertOne({
      data: {
        id_c: connectionId,
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
          id_c: connectionId
        }
      }
    });

    deepEqual(result, {
      value: 'foo',
      relation: {
        value: 'bar'
      }
    });

    await assertTableCRelation(connectionId, {
      value: 'bar',
      relation: {
        value: 'foo'
      }
    });
  });

  it('assert :: insert, connect and select relation (unique to primary) ', async () => {
    const connectionId = randomUUID();

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
          id_b: connectionId,
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

    await assertTableBRelation(connectionId, {
      value: 'bar',
      relation: {
        value: 'foo'
      }
    });
  });

  it('assert :: insert, connect and select relation (unique to secondary) ', async () => {
    const connectionAId = randomUUID();
    const connectionBId = randomUUID();

    await client.table_a.insertMany({
      data: [
        {
          id_a: connectionAId,
          value: 'bar'
        }
        /*
        {
          id_a: connectionBId,
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
            id_a: connectionAId
          }
          /*
          {
            id_a: connectionBId
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

    await assertTableARelation2(
      [connectionAId, connectionBId],
      [
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
      ]
    );
  });
});
