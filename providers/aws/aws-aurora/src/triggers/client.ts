import type { DeployOptions, EmulateClientEvent, EventContext, ContextSource } from '@ez4/project/library';
import type { DatabaseService } from '@ez4/database/library';
import type { ClusterState } from '../cluster/types';

import { getDatabaseName, getTableRepository } from '@ez4/pgclient/library';
import { getDefinitionName } from '@ez4/project/library';
import { Client as NativeClient } from '@ez4/pgclient';

import { importCluster } from '../cluster/client';
import { getClusterState } from '../cluster/utils';
import { ClusterDatabaseNotFoundError } from '../cluster/errors';
import { getConnectionOptions } from '../local/options';
import { Client as ProviderClient } from '../client';
import { getClusterName, isAuroraService } from './utils';

export const prepareLinkedClient = (context: EventContext, service: DatabaseService, options: DeployOptions): ContextSource => {
  const clusterState = getClusterState(context, service.name, options);
  const clusterId = clusterState.entryId;

  const secretArn = getDefinitionName<ClusterState>(clusterId, 'secretArn');
  const resourceArn = getDefinitionName<ClusterState>(clusterId, 'clusterArn');
  const database = getDatabaseName(service, options);

  return {
    connectionIds: [clusterId],
    dependencyIds: [clusterId],
    from: '@ez4/aws-aurora/client',
    module: 'Client',
    constructor:
      `make({` +
      `connection: { database: "${database}", resourceArn: ${resourceArn}, secretArn: ${secretArn} }, ` +
      `repository: ${JSON.stringify(getTableRepository(service.tables))}, ` +
      `debug: ${options.debug ?? false}` +
      `})`
  };
};

export const prepareEmulatorClient = async (event: EmulateClientEvent) => {
  const { service, options } = event;

  if (!isAuroraService(service)) {
    return null;
  }

  if (options.local) {
    const connection = getConnectionOptions(service, options);

    return NativeClient.make({
      debug: options.debug,
      repository: getTableRepository(service.tables),
      connection
    });
  }

  const cluster = await importCluster(getClusterName(service, options), false);

  if (!cluster) {
    throw new ClusterDatabaseNotFoundError(service.name);
  }

  return ProviderClient.make({
    debug: options.debug,
    repository: getTableRepository(service.tables),
    connection: {
      database: getDatabaseName(service, options),
      resourceArn: cluster.clusterArn,
      secretArn: cluster.secretArn
    }
  });
};
