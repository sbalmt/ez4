import type { DeployOptions, EventContext, ExtraSource, ServeOptions } from '@ez4/project/library';

import { getDatabaseName, getTableRepository } from '@ez4/pgclient/library';
import { getDefinitionName } from '@ez4/project/library';
import { DatabaseService } from '@ez4/database/library';

import { ClusterState } from '../cluster/types.js';
import { getClusterState } from '../cluster/utils.js';
import { importCluster } from '../cluster/client.js';
import { Client } from '../client.js';
import { getClusterName } from './utils.js';

export const prepareLinkedClient = (context: EventContext, service: DatabaseService, options: DeployOptions): ExtraSource => {
  const clusterState = getClusterState(context, service.name, options);
  const clusterId = clusterState.entryId;

  const secretArn = getDefinitionName<ClusterState>(clusterId, 'secretArn');
  const resourceArn = getDefinitionName<ClusterState>(clusterId, 'clusterArn');
  const database = getDatabaseName(service, options);

  return {
    entryIds: [clusterId],
    from: '@ez4/aws-aurora/client',
    module: 'Client',
    constructor:
      `make({` +
      `connection: { database: "${database}", resourceArn: ${resourceArn}, secretArn: ${secretArn} }, ` +
      `repository: ${JSON.stringify(getTableRepository(service))}, ` +
      `debug: ${options.debug ?? false}` +
      `})`
  };
};

export const prepareEmulatorClient = async (service: DatabaseService, options: ServeOptions) => {
  const cluster = await importCluster(getClusterName(service, options));

  if (!cluster) {
    return null;
  }

  return Client.make({
    debug: options.debug,
    repository: getTableRepository(service),
    connection: {
      database: getDatabaseName(service, options),
      resourceArn: cluster.clusterArn,
      secretArn: cluster.secretArn
    }
  });
};
