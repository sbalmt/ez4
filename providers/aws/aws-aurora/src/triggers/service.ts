import type { PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { getDatabaseName, getTableRepository } from '@ez4/pgclient/library';
import { PaginationMode } from '@ez4/database';

import { createCluster } from '../cluster/service';
import { createInstance } from '../instance/service';
import { createMigration } from '../migration/service';
import { getClusterName, getInstanceName, isAuroraService } from './utils';
import { UnsupportedPaginationModeError } from './errors';
import { prepareLinkedClient } from './client';

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
    repository: getTableRepository(service.tables),
    database: getDatabaseName(service, options)
  });

  context.setServiceState(clusterState, service, options);

  return true;
};
