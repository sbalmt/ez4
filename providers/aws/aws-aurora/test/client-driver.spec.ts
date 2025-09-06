import type { Database, Client as DbClient } from '@ez4/database';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { EntryStates } from '@ez4/stateful';

import { deepEqual, ok } from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import { Client } from '@ez4/aws-aurora/client';
import { deploy } from '@ez4/aws-common';

import { createCluster, createInstance, isClusterState, isInstanceState, registerTriggers } from '@ez4/aws-aurora';

describe('aurora client driver', async () => {
  let dbClient: DbClient<Database.Service>;

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

  it('assert :: transaction', async () => {
    const result = await dbClient.transaction(async (transaction: DbClient<Database.Service>) => {
      return transaction.rawQuery('SELECT 1 AS alive');
    });

    deepEqual(result, [{ alive: 1 }]);
  });

  it('assert :: transaction (nested)', async () => {
    const result = await dbClient.transaction(async (transaction: DbClient<Database.Service>) => {
      return transaction.transaction(async (innerTransaction: DbClient<Database.Service>) => {
        return innerTransaction.rawQuery('SELECT 1 AS alive');
      });
    });

    deepEqual(result, [{ alive: 1 }]);
  });
});
