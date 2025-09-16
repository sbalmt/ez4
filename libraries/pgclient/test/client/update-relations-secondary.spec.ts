import type { AnyObject } from '@ez4/utils';

import { deleteRelationTables, makeRelationClient, prepareRelationTables } from './common/relation';

import { after, beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client update secondary relations', async () => {
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
          unique_2_id: uniqueId,
          value: 'bar'
        }
      }
    });
  };

  beforeEach(async () => {
    await prepareRelationTables(client);
  });

  after(async () => {
    await deleteRelationTables(client);
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

    await assertTableBRelations(secondaryId, {
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
      relation_unique: null,
      relations: [
        {
          value: 'foo'
        }
      ]
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
          unique_2_id: connectionId
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
      relation_unique: null,
      relations: [
        {
          value: 'foo'
        }
      ]
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
          unique_2_id: null
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
      relation_unique: null,
      relations: []
    });
  });
});
