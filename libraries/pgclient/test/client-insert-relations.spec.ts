import { makeRelationClient, prepareRelationTables } from './common/relation';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client insert relations', async () => {
  const client = await makeRelationClient();

  beforeEach(async () => {
    await prepareRelationTables(client);
  });

  it('assert :: insert and select primary relation', async () => {
    const primaryId = randomUUID();
    const secondaryId = randomUUID();

    const primary = await client.ez4_test_table.insertOne({
      select: {
        value: true,
        relation_1: {
          value: true
        }
      },
      data: {
        id: primaryId,
        value: 'foo',
        relation_1: {
          id: secondaryId,
          value: 'bar'
        }
      }
    });

    deepEqual(primary, {
      value: 'foo',
      relation_1: {
        value: 'bar'
      }
    });

    const secondary = await client.ez4_test_relation_1.findOne({
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

  it('assert :: insert and select unique relation', async () => {
    const primaryId = randomUUID();
    const secondaryId = randomUUID();
    const uniqueId = randomUUID();

    const primary = await client.ez4_test_table.insertOne({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      data: {
        id: primaryId,
        value: 'foo',
        relation_2: {
          id: secondaryId,
          unique_id: uniqueId,
          value: 'bar'
        }
      }
    });

    deepEqual(primary, {
      value: 'foo',
      relation_2: {
        value: 'bar'
      }
    });

    const unique = await client.ez4_test_relation_2.findOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      where: {
        unique_id: uniqueId
      }
    });

    deepEqual(unique, {
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

    const secondary = await client.ez4_test_relation_1.insertOne({
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
        relation_1: {
          value: true
        }
      },
      where: {
        id: primaryId
      }
    });

    deepEqual(primary, {
      value: 'bar',
      relation_1: {
        value: 'foo'
      }
    });
  });

  it('assert :: insert, connect and select primary relation', async () => {
    const primaryId = randomUUID();
    const secondaryId = randomUUID();

    await client.ez4_test_relation_1.insertOne({
      data: {
        id: secondaryId,
        value: 'bar'
      }
    });

    const primary = await client.ez4_test_table.insertOne({
      select: {
        value: true,
        relation_1: {
          value: true
        }
      },
      data: {
        id: primaryId,
        value: 'foo',
        relation_1: {
          relation_1_id: secondaryId
        }
      }
    });

    deepEqual(primary, {
      value: 'foo',
      relation_1: {
        value: 'bar'
      }
    });

    const secondary = await client.ez4_test_relation_1.findOne({
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

  it('assert :: insert, connect and select unique relation', async () => {
    const primaryId = randomUUID();
    const secondaryId = randomUUID();
    const uniqueId = randomUUID();

    await client.ez4_test_relation_2.insertOne({
      data: {
        id: secondaryId,
        unique_id: uniqueId,
        value: 'bar'
      }
    });

    const primary = await client.ez4_test_table.insertOne({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      data: {
        id: primaryId,
        value: 'foo',
        relation_2: {
          relation_2_id: uniqueId
        }
      }
    });

    deepEqual(primary, {
      value: 'foo',
      relation_2: {
        value: 'bar'
      }
    });

    const unique = await client.ez4_test_relation_2.findOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      where: {
        unique_id: uniqueId
      }
    });

    deepEqual(unique, {
      value: 'bar',
      relations: [
        {
          value: 'foo'
        }
      ]
    });
  });

  it('assert :: insert, connect and select secondary relation', async () => {
    const primaryId = randomUUID();
    const secondaryId = randomUUID();

    await client.ez4_test_table.insertOne({
      data: {
        id: primaryId,
        value: 'bar'
      }
    });

    const secondary = await client.ez4_test_relation_1.insertOne({
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
            relation_1_id: primaryId
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
        relation_1: {
          value: true
        }
      },
      where: {
        id: primaryId
      }
    });

    deepEqual(primary, {
      value: 'bar',
      relation_1: {
        value: 'foo'
      }
    });
  });
});
