import type { AnyObject } from '@ez4/utils';

import { deleteRelationTables, makeRelationClient, prepareRelationTables } from './common/relation';

import { after, beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client update primary relations', async () => {
  const client = await makeRelationClient();

  const primaryId = randomUUID();
  const secondaryId = randomUUID();

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

  beforeEach(async () => {
    await prepareRelationTables(client);
  });

  after(async () => {
    await deleteRelationTables(client);
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
      relation_unique: null,
      relation: {
        value: 'foo'
      }
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
          unique_1_id: null
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
      relation_unique: null,
      relation: null
    });
  });
});
