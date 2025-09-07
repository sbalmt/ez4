import { makeSchemaClient, prepareSchemaTable } from './common/database';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client update json atomic', async () => {
  const client = await makeSchemaClient();

  const id = randomUUID();

  beforeEach(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertOne({
      data: {
        integer: 2,
        decimal: 2,
        json: {
          number: 5
        },
        id
      }
    });
  });

  it('assert :: increment json number', async () => {
    const result = await client.ez4_test_table.updateOne({
      data: {
        json: {
          number: {
            increment: 15
          }
        }
      },
      where: {
        id
      }
    });

    deepEqual(result, undefined);

    const changes = await client.ez4_test_table.findOne({
      select: {
        json: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      json: {
        number: 20
      }
    });
  });

  it('assert :: decrement json number', async () => {
    const result = await client.ez4_test_table.updateOne({
      data: {
        json: {
          number: {
            decrement: 10
          }
        }
      },
      where: {
        id
      }
    });

    deepEqual(result, undefined);

    const changes = await client.ez4_test_table.findOne({
      select: {
        json: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      json: {
        number: -5
      }
    });
  });

  it('assert :: multiply json number', async () => {
    const result = await client.ez4_test_table.updateOne({
      data: {
        json: {
          number: {
            multiply: 3
          }
        }
      },
      where: {
        id
      }
    });

    deepEqual(result, undefined);

    const changes = await client.ez4_test_table.findOne({
      select: {
        json: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      json: {
        number: 15
      }
    });
  });

  it('assert :: divide json number', async () => {
    const result = await client.ez4_test_table.updateOne({
      data: {
        json: {
          number: {
            divide: 2
          }
        }
      },
      where: {
        id
      }
    });

    deepEqual(result, undefined);

    const changes = await client.ez4_test_table.findOne({
      select: {
        json: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      json: {
        number: 2.5
      }
    });
  });
});
