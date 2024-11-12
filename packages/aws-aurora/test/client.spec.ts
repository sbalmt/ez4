import type { Database, Client as DbClient } from '@ez4/database';
import type { EntryStates } from '@ez4/stateful';
import type { Repository } from '@ez4/aws-aurora';

import { ok, equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Client } from '@ez4/aws-aurora/client';
import { SchemaTypeName } from '@ez4/schema';
import { Index, Order } from '@ez4/database';
import { deploy } from '@ez4/aws-common';

import {
  createCluster,
  createInstance,
  createMigration,
  isClusterState,
  registerTriggers
} from '@ez4/aws-aurora';

declare class TestSchema implements Database.Schema {
  id: string;
  foo?: string;
  bar?: string;
  baz?: {
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

  const repository: Repository = {
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
        type: SchemaTypeName.Object,
        properties: {
          id: {
            type: SchemaTypeName.String
          },
          foo: {
            type: SchemaTypeName.String,
            optional: true
          },
          bar: {
            type: SchemaTypeName.String,
            optional: true
          },
          baz: {
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
  };

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const clusterState = createCluster(localState, {
      clusterName: 'ez4-test-cluster-client',
      allowDeletion: true,
      enableHttp: true
    });

    const instanceState = createInstance(localState, clusterState, {
      instanceName: 'ez4-test-instance-client'
    });

    const migrationState = createMigration(localState, clusterState, instanceState, {
      database: 'ez4_test_database',
      repository
    });

    clusterId = clusterState.entryId;

    const { result } = await deploy(localState, undefined);

    const resultResource = result[clusterId];

    ok(resultResource && isClusterState(resultResource));
    ok(resultResource.result);

    const configuration = {
      database: migrationState.parameters.database,
      resourceArn: resultResource.result.clusterArn,
      secretArn: resultResource.result.secretArn!
    };

    dbClient = Client.make(configuration, repository);

    lastState = result;

    ok(dbClient);
  });

  it('assert :: insert many', async () => {
    ok(dbClient);

    const data: any[] = [];

    for (let index = 0; index < 50; index++) {
      data.push({
        id: `bulk-${index}`,
        foo: 'initial',
        bar: 'initial'
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
        foo: 'updated',
        bar: 'updated'
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
        bar: 'initial'
      }
    });
  });

  it('assert :: update one', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.updateOne({
      data: {
        foo: 'updated'
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
      bar: 'initial'
    });
  });

  it('assert :: find one', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.findOne({
      select: {
        foo: true,
        bar: true
      },
      where: {
        id: 'single'
      }
    });

    deepEqual(result, {
      foo: 'updated',
      bar: 'initial'
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

    const insertResult = await dbClient.testTable.upsertOne(query);

    equal(insertResult, undefined);

    const updateResult = await dbClient.testTable.upsertOne(query);

    deepEqual(updateResult, {
      foo: 'initial'
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
        foo: 'updated',
        baz: {
          foo: 456,
          bar: false
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
        foo: 123,
        bar: true
      }
    });
  });

  it('assert :: find json', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.findOne({
      select: {
        baz: {
          foo: true
        }
      },
      where: {
        id: 'json'
      }
    });

    deepEqual(result, {
      baz: {
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
              foo: 'initial'
            }
          }
        },
        ['test-2']: {
          insert: {
            data: {
              id: 'transaction-2',
              foo: 'initial'
            }
          }
        }
      }
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

  it('assert :: transaction :: update one', async () => {
    ok(dbClient);

    await dbClient.transaction({
      testTable: {
        ['test-1']: {
          update: {
            data: {
              foo: 'updated'
            },
            where: {
              id: 'transaction-1'
            }
          }
        },
        ['test-2']: {
          update: {
            data: {
              foo: 'updated'
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

  it('assert :: destroy', async () => {
    ok(clusterId && lastState);
    ok(lastState[clusterId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[clusterId], undefined);
  });
});
