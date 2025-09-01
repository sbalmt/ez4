import type { Database, Client as DbClient } from '@ez4/database';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { PostgresEngine } from '@ez4/aws-aurora/client';
import type { EntryStates } from '@ez4/stateful';

import { ok, equal, deepEqual } from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import { Client } from '@ez4/aws-aurora/client';
import { Index, Order } from '@ez4/database';
import { SchemaType } from '@ez4/schema';
import { deploy } from '@ez4/aws-common';

import { createCluster, createInstance, createMigration, isClusterState, registerTriggers } from '@ez4/aws-aurora';

declare class TestSchema implements Database.Schema {
  id: string;
  foo?: string;
  bar?: number;
  baz?: {
    bazFoo: number;
    bazBar: boolean;
    bazBaz: string;
  };
}

declare class Test extends Database.Service {
  engine: PostgresEngine;

  tables: [
    {
      name: 'testTable';
      schema: TestSchema;
      indexes: {
        id: Index.Primary;
      };
    }
  ];
}

describe('aurora client', () => {
  let dbClient: DbClient<Test>;

  const repository: PgTableRepository = {
    testTable: {
      name: 'test_table',
      relations: {},
      indexes: {
        id: {
          name: 'id',
          columns: ['id'],
          type: Index.Primary
        }
      },
      schema: {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String
          },
          foo: {
            type: SchemaType.String,
            optional: true
          },
          bar: {
            type: SchemaType.Number,
            optional: true
          },
          baz: {
            type: SchemaType.Object,
            optional: true,
            properties: {
              bazFoo: {
                type: SchemaType.Number
              },
              bazBar: {
                type: SchemaType.Boolean
              },
              bazBaz: {
                type: SchemaType.String
              }
            }
          }
        }
      }
    }
  };

  registerTriggers();

  before(async () => {
    const localState: EntryStates = {};

    const clusterState = createCluster(localState, {
      clusterName: 'ez4-test-cluster-client',
      allowDeletion: false,
      enableHttp: true,
      scalability: {
        maxCapacity: 1,
        minCapacity: 0
      }
    });

    const instanceState = createInstance(localState, clusterState, {
      instanceName: 'ez4-test-instance-client'
    });

    const migrationState = createMigration(localState, clusterState, instanceState, {
      database: 'ez4_test_database',
      repository
    });

    const { result } = await deploy(localState, undefined);

    const resultResource = result[clusterState.entryId];

    ok(resultResource && isClusterState(resultResource));
    ok(resultResource.result);

    dbClient = Client.make({
      repository,
      connection: {
        database: migrationState.parameters.database,
        resourceArn: resultResource.result.clusterArn,
        secretArn: resultResource.result.secretArn!
      }
    });

    dbClient.testTable.deleteMany({});
  });

  it('assert :: insert many', async () => {
    ok(dbClient);

    const data: any[] = [];

    for (let index = 0; index < 50; index++) {
      data.push({
        id: `bulk-${index}`,
        foo: 'initial',
        bar: 1000 + index
      });
    }

    await dbClient.testTable.insertMany({
      data
    });
  });

  it('assert :: count (filtered)', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.count({
      where: {
        bar: {
          gt: 1024
        }
      }
    });

    equal(result, 25);
  });

  it('assert :: update many', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.updateMany({
      data: {
        foo: 'updated',
        bar: 0
      },
      select: {
        bar: true
      }
    });

    equal(result.length, 50);
  });

  it('assert :: find many', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.findMany({
      select: {
        id: true,
        foo: true
      },
      where: {
        id: {
          isIn: ['bulk-25', 'bulk-49']
        }
      },
      order: {
        id: Order.Desc
      }
    });

    deepEqual(result, {
      records: [
        {
          id: 'bulk-49',
          foo: 'updated'
        },
        {
          id: 'bulk-25',
          foo: 'updated'
        }
      ]
    });
  });

  it('assert :: delete many', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.deleteMany({
      select: {
        foo: true
      }
    });

    equal(result.length, 50);
  });

  it('assert :: insert one', async () => {
    ok(dbClient);

    await dbClient.testTable.insertOne({
      data: {
        id: 'single',
        foo: 'initial',
        bar: 0
      }
    });
  });

  it('assert :: update one', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.updateOne({
      data: {
        foo: 'updated',
        bar: undefined
      },
      select: {
        foo: true,
        bar: true
      },
      where: {
        id: 'single'
      }
    });

    deepEqual(result, {
      foo: 'initial',
      bar: 0
    });
  });

  it('assert :: find one', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.findOne({
      select: {
        foo: true,
        bar: true,
        baz: false
      },
      where: {
        id: 'single'
      }
    });

    deepEqual(result, {
      foo: 'updated',
      bar: 0
    });
  });

  it('assert :: upsert one', async () => {
    ok(dbClient);

    const query = {
      select: {
        foo: true
      },
      where: {
        id: 'upsert'
      },
      insert: {
        id: 'upsert',
        foo: 'initial'
      },
      update: {
        foo: 'updated'
      }
    };

    // Return the current value
    const insertResult = await dbClient.testTable.upsertOne(query);

    deepEqual(insertResult, {
      foo: 'initial'
    });

    // Return the last value
    const update1Result = await dbClient.testTable.upsertOne(query);

    deepEqual(update1Result, {
      foo: 'initial'
    });

    // Return the last value
    const update2Result = await dbClient.testTable.upsertOne(query);

    deepEqual(update2Result, {
      foo: 'updated'
    });
  });

  it('assert :: delete one', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.deleteOne({
      select: {
        foo: true
      },
      where: {
        id: 'upsert'
      }
    });

    deepEqual(result, {
      foo: 'updated'
    });
  });

  it('assert :: insert json', async () => {
    ok(dbClient);

    await dbClient.testTable.insertOne({
      data: {
        id: 'json',
        baz: {
          bazFoo: 123,
          bazBar: true,
          bazBaz: 'abc'
        }
      }
    });
  });

  it('assert :: update json', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.updateOne({
      data: {
        foo: 'updated',
        baz: {
          bazFoo: 456,
          bazBar: false,
          bazBaz: 'abc'
        }
      },
      select: {
        foo: true,
        baz: true
      },
      where: {
        id: 'json'
      }
    });

    deepEqual(result, {
      foo: null,
      baz: {
        bazFoo: 123,
        bazBar: true,
        bazBaz: 'abc'
      }
    });
  });

  it('assert :: find json', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.findOne({
      select: {
        baz: {
          bazFoo: true
        }
      },
      where: {
        id: 'json'
      }
    });

    deepEqual(result, {
      baz: {
        bazFoo: 456
      }
    });
  });

  it('assert :: static transaction :: insert one', async () => {
    ok(dbClient);

    await dbClient.transaction({
      testTable: [
        {
          insert: {
            data: {
              id: 'transaction-1',
              foo: 'initial'
            }
          }
        },
        {
          insert: {
            data: {
              id: 'transaction-2',
              foo: 'initial'
            }
          }
        }
      ]
    });

    const result = await dbClient.testTable.findMany({
      select: {
        foo: true
      },
      where: {
        id: {
          startsWith: 'transaction'
        }
      }
    });

    deepEqual(result.records, [
      {
        foo: 'initial'
      },
      {
        foo: 'initial'
      }
    ]);
  });

  it('assert :: static transaction :: update one', async () => {
    ok(dbClient);

    await dbClient.transaction({
      testTable: [
        {
          update: {
            data: {
              foo: 'updated'
            },
            where: {
              id: 'transaction-1'
            }
          }
        },
        {
          update: {
            data: {
              foo: 'updated'
            },
            where: {
              id: 'transaction-2'
            }
          }
        }
      ]
    });

    const result = await dbClient.testTable.findMany({
      select: {
        foo: true
      },
      where: {
        id: {
          startsWith: 'transaction'
        }
      }
    });

    deepEqual(result.records, [
      {
        foo: 'updated'
      },
      {
        foo: 'updated'
      }
    ]);
  });

  it('assert :: static transaction :: delete one', async () => {
    ok(dbClient);

    await dbClient.transaction({
      testTable: [
        {
          delete: {
            where: {
              id: 'transaction-1'
            }
          }
        },
        {
          delete: {
            where: {
              id: 'transaction-2'
            }
          }
        }
      ]
    });

    const result = await dbClient.testTable.findMany({
      select: {
        foo: true
      },
      where: {
        id: {
          startsWith: 'transaction'
        }
      }
    });

    deepEqual(result.records, []);
  });

  it('assert :: interactive transaction', async () => {
    ok(dbClient);

    const result = await dbClient.transaction(async (client) => {
      await client.testTable.insertOne({
        data: {
          id: 'transaction-2',
          foo: 'initial'
        }
      });

      await client.testTable.updateOne({
        data: {
          foo: 'updated'
        },
        where: {
          id: 'transaction-2'
        }
      });

      return client.testTable.findOne({
        select: {
          foo: true
        },
        where: {
          id: 'transaction-2'
        }
      });
    });

    deepEqual(result, {
      foo: 'updated'
    });
  });
});
