import { makeRelationClient, prepareRelationTables } from './common/relation';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client insert relations', async () => {
  const client = await makeRelationClient();

  before(async () => {
    await prepareRelationTables(client);
  });

  it('assert :: insert and select primary relation', async () => {
    const primaryId = randomUUID();
    const secondaryId = randomUUID();

    const primary = await client.ez4_test_table.insertOne({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        id: primaryId,
        value: 'foo',
        relation: {
          id: secondaryId,
          value: 'bar'
        }
      }
    });

    deepEqual(primary, {
      value: 'foo',
      relation: {
        value: 'bar'
      }
    });

    const secondary = await client.ez4_test_relation.findOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      where: {
        id: secondaryId
      }
    });

    deepEqual(secondary, {
      value: 'bar',
      relations: [
        {
          value: 'foo'
        }
      ]
    });
  });

  it('assert :: insert and select secondary relation', async () => {
    const primaryId = randomUUID();
    const secondaryId = randomUUID();

    const secondary = await client.ez4_test_relation.insertOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        id: secondaryId,
        value: 'foo',
        relations: [
          {
            id: primaryId,
            value: 'bar'
          }
        ]
      }
    });

    deepEqual(secondary, {
      value: 'foo',
      relations: [
        {
          value: 'bar'
        }
      ]
    });

    const primary = await client.ez4_test_table.findOne({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      where: {
        id: primaryId
      }
    });

    deepEqual(primary, {
      value: 'bar',
      relation: {
        value: 'foo'
      }
    });
  });

  it('assert :: insert, connect and select primary relation', async () => {
    const primaryId = randomUUID();
    const secondaryId = randomUUID();

    await client.ez4_test_relation.insertOne({
      data: {
        id: secondaryId,
        value: 'bar'
      }
    });

    const primary = await client.ez4_test_table.insertOne({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        id: primaryId,
        value: 'foo',
        relation: {
          relation_id: secondaryId
        }
      }
    });

    deepEqual(primary, {
      value: 'foo',
      relation: {
        value: 'bar'
      }
    });

    const secondary = await client.ez4_test_relation.findOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      where: {
        id: secondaryId
      }
    });

    deepEqual(secondary, {
      value: 'bar',
      relations: [
        {
          value: 'foo'
        }
      ]
    });
  });

  // TODO: Implement connection on secondary relations first
  it.skip('assert :: insert, connect and select secondary relation', async () => {
    const primaryId = randomUUID();
    const secondaryId = randomUUID();

    await client.ez4_test_table.insertOne({
      data: {
        id: primaryId,
        value: 'bar'
      }
    });

    const secondary = await client.ez4_test_relation.insertOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        id: secondaryId,
        value: 'foo',
        relations: [
          {
            relation_id: primaryId
          }
        ]
      }
    });

    deepEqual(secondary, {
      value: 'foo',
      relations: [
        {
          value: 'bar'
        }
      ]
    });

    const primary = await client.ez4_test_table.findOne({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      where: {
        id: primaryId
      }
    });

    deepEqual(primary, {
      value: 'bar',
      relation: {
        value: 'foo'
      }
    });
  });
});
