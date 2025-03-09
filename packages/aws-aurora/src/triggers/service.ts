import type { PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { isDatabaseService } from '@ez4/database/library';

import { createInstance } from '../instance/service.js';
import { createCluster } from '../cluster/service.js';

import { getClusterName, getDatabaseName, getInstanceName } from './utils.js';
import { createMigration } from '../migration/service.js';
import { prepareLinkedClient } from './client.js';
import { getRepository } from './repository.js';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (!isDatabaseService(service) || service.engine !== 'aurora') {
    return null;
  }

  return prepareLinkedClient(context, service, options);
};

export const prepareDatabaseServices = async (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isDatabaseService(service) || service.engine !== 'aurora') {
    return;
  }

  const clusterState = createCluster(state, {
    clusterName: getClusterName(service, options),
    enableInsights: true,
    enableHttp: true
  });

  const instanceState = createInstance(state, clusterState, {
    instanceName: getInstanceName(service, options)
  });

  createMigration(state, clusterState, instanceState, {
    database: getDatabaseName(service, options),
    repository: getRepository(service)
  });

  context.setServiceState(clusterState, service, options);
};
