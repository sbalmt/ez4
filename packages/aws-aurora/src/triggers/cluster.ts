import type { PrepareResourceEvent } from '@ez4/project/library';

import { isDatabaseService } from '@ez4/database/library';
import { toCamelCase } from '@ez4/utils';

import { createCluster } from '../cluster/service.js';
import { createInstance } from '../instance/service.js';
import { getClusterName, getInstanceName } from './utils.js';

export const prepareDatabaseServices = async (event: PrepareResourceEvent) => {
  const { state, service, options } = event;

  if (!isDatabaseService(service) || service.engine !== 'aurora') {
    return;
  }

  const clusterState = createCluster(state, {
    clusterName: getClusterName(service, options),
    database: toCamelCase(service.name),
    enableInsights: true,
    enableHttp: true
  });

  createInstance(state, clusterState, {
    instanceName: getInstanceName(service, options)
  });
};
