import type { Database, Client as DbClient, Index } from '@ez4/database';
import type { EntryStates } from '@ez4/stateful';

import { ok, equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Client } from '@ez4/aws-aurora/client';
import { SchemaTypeName } from '@ez4/schema';
import { deploy } from '@ez4/aws-common';

import { createCluster, createInstance, isClusterState, registerTriggers } from '@ez4/aws-aurora';

declare class TestSchema implements Database.Schema {
  id: string;
  value?: string;
  extra?: {
    foo: number;
    bar: boolean;
  };
}

declare class Test extends Database.Service<[TestSchema]> {
  engine: 'test';

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

describe.only('aurora client', () => {
  let lastState: EntryStates | undefined;
  let clusterId: string | undefined;
  let dbClient: DbClient<Test>;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createCluster(localState, {
      clusterName: 'ez4-test-cluster-client',
      database: 'ez4_test_database',
      allowDeletion: true,
      enableHttp: true
    });

    createInstance(localState, resource, {
      instanceName: 'ez4-test-instance-client'
    });

    clusterId = resource.entryId;

    const { result } = await deploy(localState, undefined);

    const resultResource = result[clusterId];

    ok(resultResource && isClusterState(resultResource));
    ok(resultResource.result);

    lastState = result;

    dbClient = Client.make(
      {
        database: resultResource.parameters.database!,
        resourceArn: resultResource.result.clusterArn,
        secretArn: resultResource.result.secretArn!
      },
      {
        testTable: {
          tableName: 'test_table',
          tableSchema: {
            type: SchemaTypeName.Object,
            properties: {
              id: {
                type: SchemaTypeName.String
              },
              value: {
                type: SchemaTypeName.String,
                optional: true
              },
              extra: {
                type: SchemaTypeName.Object,
                optional: true,
                properties: {
                  foo: {
                    type: SchemaTypeName.Number
                  },
                  bar: {
                    type: SchemaTypeName.Boolean
                  }
                }
              }
            }
          }
        }
      }
    );

    ok(dbClient);
  });

  it('assert :: create table', async () => {
    ok(dbClient);

    await dbClient.rawQuery(
      `CREATE TABLE "test_table" (id TEXT PRIMARY KEY, value TEXT, extra JSONB)`
    );
  });

  it('assert :: insert many', async () => {
    ok(dbClient);

    const data: any[] = [];

    for (let index = 0; index < 50; index++) {
      data.push({
        id: `bulk-${index}`,
        value: 'test'
      });
    }

    await dbClient.testTable.insertMany({
      data
    });
  });

  it('assert :: update many', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.updateMany({
      data: {
        value: 'updated'
      },
      select: {
        value: true
      }
    });

    equal(result.length, 50);
  });

  it('assert :: find many', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.findMany({
      select: {
        id: true,
        value: true
      },
      where: {
        id: 'bulk-25'
      }
    });

    deepEqual(result, {
      records: [
        {
          id: 'bulk-25',
          value: 'updated'
        }
      ]
    });
  });

  it('assert :: delete many', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.deleteMany({
      select: {
        value: true
      }
    });

    equal(result.length, 50);
  });

  it('assert :: insert one', async () => {
    ok(dbClient);

    await dbClient.testTable.insertOne({
      data: {
        id: 'single',
        value: 'initial'
      }
    });
  });

  it('assert :: update one', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.updateOne({
      data: {
        value: 'updated'
      },
      select: {
        value: true
      },
      where: {
        id: 'single'
      }
    });

    deepEqual(result, {
      value: 'initial'
    });
  });

  it('assert :: find one', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.findOne({
      select: {
        value: true
      },
      where: {
        id: 'single'
      }
    });

    deepEqual(result, {
      value: 'updated'
    });
  });

  it('assert :: upsert one', async () => {
    ok(dbClient);

    const query = {
      select: {
        value: true
      },
      where: {
        id: 'upsert'
      },
      insert: {
        id: 'upsert',
        value: 'initial'
      },
      update: {
        value: 'updated'
      }
    };

    const insertResult = await dbClient.testTable.upsertOne(query);

    equal(insertResult, undefined);

    const updateResult = await dbClient.testTable.upsertOne(query);

    deepEqual(updateResult, {
      value: 'initial'
    });
  });

  it('assert :: delete one', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.deleteOne({
      select: {
        value: true
      },
      where: {
        id: 'upsert'
      }
    });

    deepEqual(result, {
      value: 'updated'
    });
  });

  it('assert :: insert json', async () => {
    ok(dbClient);

    await dbClient.testTable.insertOne({
      data: {
        id: 'json',
        extra: {
          foo: 123,
          bar: true
        }
      }
    });
  });

  it('assert :: update json', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.updateOne({
      data: {
        extra: {
          foo: 456,
          bar: false
        }
      },
      select: {
        extra: true
      },
      where: {
        id: 'json'
      }
    });

    deepEqual(result, {
      extra: {
        foo: 123,
        bar: true
      }
    });
  });

  it('assert :: find json', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.findOne({
      select: {
        extra: {
          foo: true
        }
      },
      where: {
        id: 'json'
      }
    });

    deepEqual(result, {
      extra: {
        foo: 456
      }
    });
  });

  it('assert :: transaction :: insert one', async () => {
    ok(dbClient);

    await dbClient.transaction({
      testTable: {
        ['test-1']: {
          insert: {
            data: {
              id: 'transaction-1',
              value: 'initial'
            }
          }
        },
        ['test-2']: {
          insert: {
            data: {
              id: 'transaction-2',
              value: 'initial'
            }
          }
        }
      }
    });

    const result = await dbClient.testTable.findMany({
      select: {
        value: true
      },
      where: {
        id: {
          startsWith: 'transaction'
        }
      }
    });

    deepEqual(result.records, [
      {
        value: 'initial'
      },
      {
        value: 'initial'
      }
    ]);
  });

  it('assert :: transaction :: update one', async () => {
    ok(dbClient);

    await dbClient.transaction({
      testTable: {
        ['test-1']: {
          update: {
            data: {
              value: 'updated'
            },
            where: {
              id: 'transaction-1'
            }
          }
        },
        ['test-2']: {
          update: {
            data: {
              value: 'updated'
            },
            where: {
              id: 'transaction-2'
            }
          }
        }
      }
    });

    const result = await dbClient.testTable.findMany({
      select: {
        value: true
      },
      where: {
        id: {
          startsWith: 'transaction'
        }
      }
    });

    deepEqual(result.records, [
      {
        value: 'updated'
      },
      {
        value: 'updated'
      }
    ]);
  });

  it('assert :: transaction :: delete one', async () => {
    ok(dbClient);

    await dbClient.transaction({
      testTable: {
        ['test-1']: {
          delete: {
            where: {
              id: 'transaction-1'
            }
          }
        },
        ['test-2']: {
          delete: {
            where: {
              id: 'transaction-2'
            }
          }
        }
      }
    });

    const result = await dbClient.testTable.findMany({
      select: {
        value: true
      },
      where: {
        id: {
          startsWith: 'transaction'
        }
      }
    });

    deepEqual(result.records, []);
  });

  it('assert :: drop table', async () => {
    ok(dbClient);

    await dbClient.rawQuery(`DROP TABLE "test_table"`);
  });

  it('assert :: destroy', async () => {
    ok(clusterId && lastState);
    ok(lastState[clusterId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[clusterId], undefined);
  });
});
