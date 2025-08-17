import type { PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { getDatabaseName, getTablesRepository } from '@ez4/pgclient/library';
import { PaginationMode } from '@ez4/database';

import { createCluster } from '../cluster/service.js';
import { createInstance } from '../instance/service.js';
import { createMigration } from '../migration/service.js';
import { getClusterName, getInstanceName, isAuroraService } from './utils.js';
import { UnsupportedPaginationModeError } from './errors.js';
import { prepareLinkedClient } from './client.js';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (isAuroraService(service)) {
    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareDatabaseServices = async (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isAuroraService(service)) {
    return false;
  }

  const { engine, scalability } = service;

  if (engine.paginationMode === PaginationMode.Cursor) {
    throw new UnsupportedPaginationModeError(engine.paginationMode);
  }

  const clusterState = createCluster(state, {
    clusterName: getClusterName(service, options),
    tags: options.tags,
    enableInsights: true,
    enableHttp: true,
    scalability
  });

  const instanceState = createInstance(state, clusterState, {
    instanceName: getInstanceName(service, options),
    tags: options.tags
  });

  createMigration(state, clusterState, instanceState, {
    repository: getTablesRepository(service.tables),
    database: getDatabaseName(service, options)
  });

  context.setServiceState(clusterState, service, options);

  return true;
};
