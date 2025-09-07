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

    await client.ez4_test_table.insertOne({
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
    const primary = await client.ez4_test_table.updateOne({
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
      value: 'bar-updated',
      relations: [
        {
          value: 'foo'
        }
      ]
    });
  });

  it('assert :: update and select unique relation', async () => {
    const primary = await client.ez4_test_table.updateOne({
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

    const secondary = await client.ez4_test_relation_2.findOne({
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

  it('assert :: update and select secondary relation', async () => {
    const secondary = await client.ez4_test_relation_1.updateOne({
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

  it('assert :: update, disconnect and select primary relation', async () => {
    const primary = await client.ez4_test_table.updateOne({
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
      relations: []
    });
  });

  it('assert :: update, disconnect and select unique relation', async () => {
    const primary = await client.ez4_test_table.updateOne({
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
      relations: []
    });
  });

  it('assert :: update, disconnect and select secondary relation', async () => {
    const secondary = await client.ez4_test_relation_1.updateOne({
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
      value: 'foo',
      relation_1: null
    });
  });
});
