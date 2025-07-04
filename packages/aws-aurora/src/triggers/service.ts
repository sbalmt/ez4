import type { PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { PaginationMode } from '@ez4/database';

import { createCluster } from '../cluster/service.js';
import { createInstance } from '../instance/service.js';
import { createMigration } from '../migration/service.js';
import { getClusterName, getDatabaseName, getInstanceName, isAuroraService } from './utils.js';
import { UnsupportedPaginationModeError } from './errors.js';
import { prepareLinkedClient } from './client.js';
import { getRepository } from './repository.js';

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
    return;
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
    database: getDatabaseName(service, options),
    repository: getRepository(service)
  });

  context.setServiceState(clusterState, service, options);
};
