import { makeRelationClient, prepareRelationTables } from './common/relation';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client update relations', async () => {
  const client = await makeRelationClient();

  const primaryId = randomUUID();
  const secondaryId = randomUUID();
  const uniqueId = randomUUID();

  beforeEach(async () => {
    await prepareRelationTables(client);

    await client.table_a.insertOne({
      data: {
        id: primaryId,
        value: 'foo',
        relation_1: {
          id: secondaryId,
          value: 'bar'
        },
        relation_2: {
          id: secondaryId,
          unique_id: uniqueId,
          value: 'bar'
        }
      }
    });
  });

  it('assert :: update and select primary relation', async () => {
    const primary = await client.table_a.updateOne({
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
        id: primaryId
      }
    });

    deepEqual(primary, {
      value: 'foo',
      relation_1: {
        value: 'bar'
      }
    });

    // Inverse check
    const secondary = await client.table_b.findOne({
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
      value: 'bar-updated',
      relations: [
        {
          value: 'foo'
        }
      ]
    });
  });

  it('assert :: update and select unique relation', async () => {
    const primary = await client.table_a.updateOne({
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
        id: primaryId
      }
    });

    deepEqual(primary, {
      value: 'foo',
      relation_2: {
        value: 'bar'
      }
    });

    // Inverse check
    const secondary = await client.table_c.findOne({
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

    deepEqual(secondary, {
      value: 'bar-updated',
      relations: [
        {
          value: 'foo'
        }
      ]
    });
  });

  it('assert :: update and select secondary (from primary) relation', async () => {
    const secondary = await client.table_b.updateOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        relations: {
          value: 'foo-updated'
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

    // Inverse check
    const primary = await client.table_a.findOne({
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
      value: 'foo-updated',
      relation_1: {
        value: 'bar'
      }
    });
  });

  it('assert :: update and select secondary (from unique) relation', async () => {
    const secondary = await client.table_c.updateOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        relations: {
          value: 'foo-updated'
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

    // Inverse check
    const primary = await client.table_a.findOne({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      where: {
        id: primaryId
      }
    });

    deepEqual(primary, {
      value: 'foo-updated',
      relation_2: {
        value: 'bar'
      }
    });
  });

  it('assert :: update, disconnect and select primary relation', async () => {
    const primary = await client.table_a.updateOne({
      select: {
        value: true,
        relation_1: {
          value: true
        }
      },
      data: {
        relation_1: {
          relation_1_id: null
        }
      },
      where: {
        id: primaryId
      }
    });

    deepEqual(primary, {
      value: 'foo',
      relation_1: {
        value: 'bar'
      }
    });

    // Inverse check
    const secondary = await client.table_b.findOne({
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
      relations: []
    });
  });

  it('assert :: update, disconnect and select unique relation', async () => {
    const primary = await client.table_a.updateOne({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      data: {
        relation_2: {
          relation_2_id: null
        }
      },
      where: {
        id: primaryId
      }
    });

    deepEqual(primary, {
      value: 'foo',
      relation_2: {
        value: 'bar'
      }
    });

    // Inverse check
    const unique = await client.table_c.findOne({
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
      relations: []
    });
  });

  it('assert :: update, disconnect and select secondary (from primary) relation', async () => {
    const secondary = await client.table_b.updateOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        relations: {
          relation_1_id: null
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

    // Inverse check
    const primary = await client.table_a.findOne({
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
      value: 'foo',
      relation_1: null
    });
  });

  it('assert :: update, disconnect and select secondary (from unique) relation', async () => {
    const secondary = await client.table_c.updateOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        relations: {
          relation_2_id: null
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

    // Inverse check
    const primary = await client.table_a.findOne({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      where: {
        id: primaryId
      }
    });

    deepEqual(primary, {
      value: 'foo',
      relation_2: null
    });
  });

  it('assert :: update, connect and select primary relation', async () => {
    await client.table_a.updateMany({
      data: {
        relation_1: {
          relation_1_id: null
        }
      }
    });

    // Reconnect
    const primary = await client.table_a.updateOne({
      select: {
        value: true,
        relation_1: {
          value: true
        }
      },
      data: {
        relation_1: {
          relation_1_id: secondaryId
        }
      },
      where: {
        id: primaryId
      }
    });

    deepEqual(primary, {
      value: 'foo',
      relation_1: null
    });

    // Inverse check
    const secondary = await client.table_b.findOne({
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

  it('assert :: update, connect and select unique relation', async () => {
    await client.table_a.updateMany({
      data: {
        relation_2: {
          relation_2_id: null
        }
      }
    });

    // Reconnect
    const primary = await client.table_a.updateOne({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      data: {
        relation_2: {
          relation_2_id: uniqueId
        }
      },
      where: {
        id: primaryId
      }
    });

    deepEqual(primary, {
      value: 'foo',
      relation_2: null
    });

    // Inverse check
    const unique = await client.table_c.findOne({
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

  it('assert :: update, connect and select secondary (from primary) relation', async () => {
    await client.table_a.updateMany({
      data: {
        relation_1: {
          relation_1_id: null
        }
      }
    });

    // Reconnect
    const secondary = await client.table_b.updateOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        relations: {
          relation_1_id: null
        }
      },
      where: {
        id: secondaryId
      }
    });

    deepEqual(secondary, {
      value: 'bar',
      relations: []
    });

    // Inverse check
    const primary = await client.table_a.findOne({
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
      value: 'foo',
      relation_1: {
        value: 'bar'
      }
    });
  });

  it('assert :: update, connect and select secondary (from unique) relation', async () => {
    await client.table_a.updateMany({
      data: {
        relation_2: {
          relation_2_id: null
        }
      }
    });

    // Reconnect
    const secondary = await client.table_c.updateOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        relations: {
          relation_2_id: null
        }
      },
      where: {
        id: secondaryId
      }
    });

    deepEqual(secondary, {
      value: 'bar',
      relations: []
    });

    // Inverse check
    const primary = await client.table_a.findOne({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      where: {
        id: primaryId
      }
    });

    deepEqual(primary, {
      value: 'foo',
      relation_2: {
        value: 'bar'
      }
    });
  });
});
