import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client update atomic', async () => {
  const client = await makeSchemaClient();

  const id = randomUUID();

  beforeEach(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertOne({
      data: {
        integer: 2,
        decimal: 2,
        id
      }
    });
  });

  it('assert :: increment number', async () => {
    const result = await client.ez4_test_table.updateOne({
      data: {
        integer: {
          increment: 15
        },
        decimal: {
          increment: 5
        }
      },
      where: {
        id
      }
    });

    deepEqual(result, undefined);

    const changes = await client.ez4_test_table.findOne({
      select: {
        integer: true,
        decimal: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      integer: 17,
      decimal: 7
    });
  });

  it('assert :: decrement number', async () => {
    const result = await client.ez4_test_table.updateOne({
      data: {
        integer: {
          decrement: 1
        },
        decimal: {
          decrement: 5.5
        }
      },
      where: {
        id
      }
    });

    deepEqual(result, undefined);

    const changes = await client.ez4_test_table.findOne({
      select: {
        integer: true,
        decimal: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      integer: 1,
      decimal: -3.5
    });
  });

  it('assert :: multiply number', async () => {
    const result = await client.ez4_test_table.updateOne({
      data: {
        integer: {
          multiply: 3
        },
        decimal: {
          multiply: 5
        }
      },
      where: {
        id
      }
    });

    deepEqual(result, undefined);

    const changes = await client.ez4_test_table.findOne({
      select: {
        integer: true,
        decimal: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      integer: 6,
      decimal: 10
    });
  });

  it('assert :: divide number', async () => {
    const result = await client.ez4_test_table.updateOne({
      data: {
        integer: {
          divide: 15
        },
        decimal: {
          divide: 10
        }
      },
      where: {
        id
      }
    });

    deepEqual(result, undefined);

    const changes = await client.ez4_test_table.findOne({
      select: {
        integer: true,
        decimal: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      integer: 0,
      decimal: 0.2
    });
  });
});
