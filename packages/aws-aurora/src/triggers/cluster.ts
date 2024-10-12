import type { PrepareResourceEvent } from '@ez4/project/library';

import { isDatabaseService } from '@ez4/database/library';

import { createCluster } from '../cluster/service.js';

export const prepareDatabaseServices = async (event: PrepareResourceEvent) => {
  const { state, service } = event;

  if (!isDatabaseService(service)) {
    return;
  }

  const { name } = service;

  createCluster(state, {
    clusterName: name,
    enableInsights: true,
    enableHttp: true
  });
};
