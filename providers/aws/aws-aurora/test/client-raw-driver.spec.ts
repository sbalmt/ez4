import type { Database, Client as DbClient } from '@ez4/database';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { EntryStates } from '@ez4/state';

import { deepEqual, ok } from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import { Client } from '@ez4/aws-aurora/client/api';
import { deploy } from '@ez4/aws-common';

import { createCluster, createInstance, isClusterState, isInstanceState, registerTriggers } from '@ez4/aws-aurora';

describe('aurora client driver', { timeout: 180000 }, async () => {
  let dbClient: DbClient<Database.Service<any>>;

  const repository: PgTableRepository = {};

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

    ok(instanceState && isInstanceState(instanceState));

    const { result } = await deploy(localState, undefined);

    const resultResource = result[clusterState.entryId];

    ok(resultResource && isClusterState(resultResource));
    ok(resultResource.result);

    dbClient = Client.make({
      repository,
      connection: {
        database: 'postgres',
        resourceArn: resultResource.result.clusterArn,
        secretArn: resultResource.result.secretArn!
      }
    });
  });

  it('assert :: raw query', async () => {
    const result = await dbClient.rawQuery('SELECT 1 AS alive');

    deepEqual(result, [{ alive: 1 }]);
  });

  it('assert :: raw query (json column)', async () => {
    const result = await dbClient.rawQuery(`SELECT '{"a":1}'::json AS column`);

    deepEqual(result, [{ column: { a: 1 } }]);
  });

  it('assert :: raw query (jsonb column)', async () => {
    const result = await dbClient.rawQuery(`SELECT '{"a":1}'::jsonb AS column`);

    deepEqual(result, [{ column: { a: 1 } }]);
  });

  it('assert :: raw query (json aggregate)', async () => {
    const result = await dbClient.rawQuery(`SELECT jsonb_agg(to_jsonb(t)) AS column FROM (SELECT 1 AS field) t`);

    deepEqual(result, [{ column: [{ field: 1 }] }]);
  });

  it('assert :: transaction', async () => {
    const result = await dbClient.transaction(async (transaction: DbClient<Database.Service<any>>) => {
      return transaction.rawQuery('SELECT 1 AS alive');
    });

    deepEqual(result, [{ alive: 1 }]);
  });

  it('assert :: transaction (nested)', async () => {
    const result = await dbClient.transaction(async (transaction: DbClient<Database.Service<any>>) => {
      return transaction.transaction(async (innerTransaction: DbClient<Database.Service<any>>) => {
        return innerTransaction.rawQuery('SELECT 1 AS alive');
      });
    });

    deepEqual(result, [{ alive: 1 }]);
  });
});
