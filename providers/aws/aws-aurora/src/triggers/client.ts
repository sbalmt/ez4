import type { DeployOptions, EmulateDescriptorEvent, EventContext, ContextSource } from '@ez4/project/library';
import type { DatabaseService } from '@ez4/database/library';
import type { ServiceOptions } from '../worker/service';
import type { ClusterState } from '../cluster/types';

import { getDatabaseName } from '@ez4/pgclient/utils';
import { getTableRepository } from '@ez4/pgclient/library';
import { getDefinitionName } from '@ez4/project/library';

import { importCluster } from '../cluster/client';
import { getClusterState } from '../cluster/utils';
import { ClusterDatabaseNotFoundError } from '../cluster/errors';
import { getIntegrityState } from '../integrity/utils';
import { getConnectionOptions } from '../local/options';
import { ConnectionMode } from '../client/types';
import { getClusterName, isAuroraService } from './utils';

export const prepareLinkedClient = (context: EventContext, service: DatabaseService, options: DeployOptions): ContextSource => {
  const integrityName = getDatabaseName(service, options);
  const integrityState = getIntegrityState(context, integrityName, options);
  const integrityId = integrityState.entryId;

  const clusterState = getClusterState(context, service.name, options);
  const clusterId = clusterState.entryId;

  const secretArn = getDefinitionName<ClusterState>(clusterId, 'secretArn');
  const resourceArn = getDefinitionName<ClusterState>(clusterId, 'clusterArn');
  const endpoint = getDefinitionName<ClusterState>(clusterId, 'writerEndpoint');
  const database = getDatabaseName(service, options);

  const { connectionMode = ConnectionMode.Api } = service.options ?? {};

  const isApiMode = connectionMode === ConnectionMode.Api;

  const connection = isApiMode ? `resourceArn: ${resourceArn}` : `endpoint: ${endpoint}`;

  return {
    from: `@ez4/aws-aurora/client/${connectionMode}`,
    module: 'Client',
    constructor:
      `@{EZ4_MODULE_IMPORT}.make({` +
      `connection: { database: "${database}", secretArn: ${secretArn}, ${connection} }, ` +
      `repository: ${JSON.stringify(getTableRepository(service.tables))}, ` +
      `debug: ${options.debug ?? false}` +
      `})`,
    connectionIds: [clusterId],
    dependencyIds: [clusterId, integrityId],
    options: service.options,
    requireVpc: !isApiMode
  };
};

export const prepareEmulatorDescriptor = async (event: EmulateDescriptorEvent) => {
  const { service, options } = event;

  if (!isAuroraService(service)) {
    return null;
  }

  return {
    name: 'makeService',
    module: '@ez4/aws-aurora/worker',
    options: await getDescriptorOptions(service, options)
  };
};

const getDescriptorOptions = async (service: DatabaseService, options: EmulateDescriptorEvent['options']): Promise<ServiceOptions> => {
  const repository = getTableRepository(service.tables);

  if (options.local) {
    return {
      local: true,
      context: {
        debug: options.debug,
        connection: getConnectionOptions(service, options),
        repository
      }
    };
  }

  const cluster = await importCluster(undefined, getClusterName(service, options));

  if (!cluster) {
    throw new ClusterDatabaseNotFoundError(service.name);
  }

  return {
    local: false,
    defaults: service.options,
    context: {
      debug: options.debug,
      repository,
      connection: {
        database: getDatabaseName(service, options),
        secretArn: cluster.secretArn,
        resourceArn: cluster.clusterArn,
        endpoint: cluster.writerEndpoint
      }
    }
  };
};
