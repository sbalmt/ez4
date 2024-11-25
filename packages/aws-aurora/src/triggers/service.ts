import type { PrepareResourceEvent } from '@ez4/project/library';

import { isDatabaseService } from '@ez4/database/library';

import { createInstance } from '../instance/service.js';
import { createCluster } from '../cluster/service.js';

import { getClusterName, getDatabaseName, getInstanceName } from './utils.js';
import { createMigration } from '../migration/service.js';
import { getRepository } from './repository.js';

export const prepareDatabaseServices = async (event: PrepareResourceEvent) => {
  const { state, service, options } = event;

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
};
