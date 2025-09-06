import type { PgTableRepository, PostgresEngine } from '@ez4/pgclient/library';
import type { Database, Client as DbClient } from '@ez4/database';
import type { EntryStates } from '@ez4/stateful';
import type { String } from '@ez4/schema';

import { before, after, describe, it } from 'node:test';
import { deepEqual, ok } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { Client } from '@ez4/aws-aurora/client';
import { SchemaType } from '@ez4/schema';
import { deploy } from '@ez4/aws-common';
import { Index } from '@ez4/database';

import { createCluster, createInstance, createMigration, isClusterState, registerTriggers } from '@ez4/aws-aurora';

declare class Test extends Database.Service {
  engine: PostgresEngine;

  tables: [
    {
      name: 'ez4_test_schema';
      indexes: {
        id: Index.Primary;
      };
      schema: {
        id: string;
        integer?: number;
        decimal?: number;
        boolean?: boolean;
        string?: string;
        datetime?: String.DateTime;
        date?: String.Date;
        time?: String.Time;
        json?: {
          foo: string;
          bar: boolean;
          baz?: number | null;
        };
      };
    }
  ];
}

describe('aurora dbClient schema', async () => {
  let dbClient: DbClient<Test>;

  const repository: PgTableRepository = {
    ez4_test_schema: {
      name: 'ez4_test_schema',
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
            type: SchemaType.String,
            format: 'uuid'
          },
          integer: {
            type: SchemaType.Number,
            format: 'integer',
            optional: true,
            nullable: true
          },
          decimal: {
            type: SchemaType.Number,
            format: 'decimal',
            optional: true,
            nullable: true
          },
          boolean: {
            type: SchemaType.Boolean,
            optional: true,
            nullable: true
          },
          string: {
            type: SchemaType.String,
            optional: true,
            nullable: true
          },
          datetime: {
            type: SchemaType.String,
            format: 'date-time',
            optional: true,
            nullable: true
          },
          date: {
            type: SchemaType.String,
            format: 'date',
            optional: true,
            nullable: true
          },
          time: {
            type: SchemaType.String,
            format: 'time',
            optional: true,
            nullable: true
          },
          json: {
            type: SchemaType.Object,
            optional: true,
            nullable: true,
            properties: {
              foo: {
                type: SchemaType.String
              },
              bar: {
                type: SchemaType.Boolean
              },
              baz: {
                type: SchemaType.Number,
                optional: true,
                nullable: true
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
      database: 'ez4_test_schema',
      repository
    });

    const { result } = await deploy(localState, undefined);

    const resultResource = result[clusterState.entryId];

    ok(resultResource && isClusterState(resultResource));
    ok(resultResource.result);

    dbClient = Client.make({
      debug: false,
      repository,
      connection: {
        database: migrationState.parameters.database,
        resourceArn: resultResource.result.clusterArn,
        secretArn: resultResource.result.secretArn!
      }
    });

    dbClient.ez4_test_schema.deleteMany({});
  });

  after(async () => {
    await dbClient.rawQuery(`DROP TABLE "ez4_test_schema"`);
  });

  it('assert :: insert and select boolean', async () => {
    const id = randomUUID();

    await dbClient.ez4_test_schema.insertOne({
      data: {
        boolean: false,
        id
      }
    });

    const result = await dbClient.ez4_test_schema.findOne({
      select: {
        boolean: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      boolean: false
    });
  });

  it('assert :: insert and select integer', async () => {
    const id = randomUUID();

    await dbClient.ez4_test_schema.insertOne({
      data: {
        integer: 122333,
        id
      }
    });

    const result = await dbClient.ez4_test_schema.findOne({
      select: {
        integer: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      integer: 122333
    });
  });

  it('assert :: insert and select decimal', async () => {
    const id = randomUUID();

    await dbClient.ez4_test_schema.insertOne({
      data: {
        decimal: 10.5678,
        id
      }
    });

    const result = await dbClient.ez4_test_schema.findOne({
      select: {
        decimal: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      decimal: 10.5678
    });
  });

  it('assert :: insert and select string', async () => {
    const id = randomUUID();

    await dbClient.ez4_test_schema.insertOne({
      data: {
        string: 'abc',
        id
      }
    });

    const result = await dbClient.ez4_test_schema.findOne({
      select: {
        string: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      string: 'abc'
    });
  });

  it('assert :: insert and select date-time', async () => {
    const id = randomUUID();
    const datetime = '1991-04-23T23:59:30.000Z';

    await dbClient.ez4_test_schema.insertOne({
      data: {
        datetime,
        id
      }
    });

    const result = await dbClient.ez4_test_schema.findOne({
      select: {
        datetime: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      datetime
    });
  });

  it('assert :: insert and select date', async () => {
    const id = randomUUID();
    const date = '1991-04-23';

    await dbClient.ez4_test_schema.insertOne({
      data: {
        date,
        id
      }
    });

    const result = await dbClient.ez4_test_schema.findOne({
      select: {
        date: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      date
    });
  });

  it('assert :: insert and select time', async () => {
    const id = randomUUID();
    const time = '23:59:30.000Z';

    await dbClient.ez4_test_schema.insertOne({
      data: {
        time,
        id
      }
    });

    const result = await dbClient.ez4_test_schema.findOne({
      select: {
        time: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      time
    });
  });

  it('assert :: insert and select json', async () => {
    const id = randomUUID();
    const json = {
      foo: 'abc',
      bar: true,
      baz: null
    };

    await dbClient.ez4_test_schema.insertOne({
      data: {
        json,
        id
      }
    });

    const result = await dbClient.ez4_test_schema.findOne({
      select: {
        json: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      json
    });
  });
});
