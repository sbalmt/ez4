import { makeRelationClient, prepareRelationTables } from './common/relation';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client update relations', async () => {
  const client = await makeRelationClient();

  const primaryId = randomUUID();
  const secondaryId = randomUUID();

  beforeEach(async () => {
    await prepareRelationTables(client);

    await client.ez4_test_table.insertOne({
      data: {
        id: primaryId,
        value: 'foo',
        relation: {
          id: secondaryId,
          value: 'bar'
        }
      }
    });
  });

  it('assert :: update and select primary relation', async () => {
    const primary = await client.ez4_test_table.updateOne({
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
        id: primaryId
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
      value: 'bar-updated',
      relations: [
        {
          value: 'foo'
        }
      ]
    });
  });

  it('assert :: update and select secondary relation', async () => {
    const secondary = await client.ez4_test_relation.updateOne({
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
      value: 'foo-updated',
      relation: {
        value: 'bar'
      }
    });
  });

  it('assert :: update, disconnect and select primary relation', async () => {
    const primary = await client.ez4_test_table.updateOne({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        relation: {
          relation_id: null
        }
      },
      where: {
        id: primaryId
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
      relations: []
    });
  });

  // TODO: Implement connection on secondary relations first
  it.skip('assert :: update, disconnect and select secondary relation', async () => {
    const secondary = await client.ez4_test_relation.updateOne({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        relations: {
          relation_id: null
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
      value: 'foo'
    });
  });
});
