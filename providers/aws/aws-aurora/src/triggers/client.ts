import type { DeployOptions, EmulateClientEvent, EventContext, ContextSource } from '@ez4/project/library';
import type { DatabaseService } from '@ez4/database/library';
import type { AnyObject } from '@ez4/utils';
import type { ClusterState } from '../cluster/types';
import type { ClientOptions } from '../client';

import { getDatabaseName } from '@ez4/pgclient/utils';
import { getTableRepository } from '@ez4/pgclient/library';
import { Client as LocalClient } from '@ez4/pgclient/driver';
import { getDefinitionName } from '@ez4/project/library';

import { importCluster } from '../cluster/client';
import { getClusterState } from '../cluster/utils';
import { ClusterDatabaseNotFoundError } from '../cluster/errors';
import { getIntegrityState } from '../integrity/utils';
import { Client as NativeClient } from '../client/providers/native';
import { Client as ApiClient } from '../client/providers/api';
import { ConnectionMode } from '../client/types';
import { getConnectionOptions } from '../local/options';
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
    requireVpc: !isApiMode
  };
};

export const prepareEmulatorClient = async (event: EmulateClientEvent) => {
  const { service, options } = event;

  if (!isAuroraService(service)) {
    return null;
  }

  if (options.local) {
    const connection = getConnectionOptions(service, options);

    const instance = LocalClient.make({
      debug: options.debug,
      repository: getTableRepository(service.tables),
      connection
    });

    return {
      make: () => instance
    };
  }

  const cluster = await importCluster(undefined, getClusterName(service, options));

  if (!cluster) {
    throw new ClusterDatabaseNotFoundError(service.name);
  }

  const connection = {
    database: getDatabaseName(service, options),
    secretArn: cluster.secretArn
  };

  return {
    make: (serviceOptions: AnyObject) => {
      const clientOptions: ClientOptions = {
        ...service.options,
        ...serviceOptions
      };

      const { connectionMode } = clientOptions;

      if (connectionMode === ConnectionMode.Native) {
        return NativeClient.make({
          debug: options.debug,
          repository: getTableRepository(service.tables),
          connection: {
            ...connection,
            endpoint: cluster.writerEndpoint
          }
        });
      }

      return ApiClient.make({
        debug: options.debug,
        repository: getTableRepository(service.tables),
        connection: {
          ...connection,
          resourceArn: cluster.clusterArn
        }
      });
    }
  };
};
