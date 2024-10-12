import type { EntryState, StepContext } from '@ez4/stateful';
import type { ClusterState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';

import { ClusterServiceType } from './types.js';

export const isClusterState = (resource: EntryState): resource is ClusterState => {
  return resource.type === ClusterServiceType;
};

export const getClusterName = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<ClusterState>(ClusterServiceType).at(0)?.result;

  if (!resource?.clusterName) {
    throw new IncompleteResourceError(serviceName, resourceId, 'clusterName');
  }

  return resource.clusterName;
};
