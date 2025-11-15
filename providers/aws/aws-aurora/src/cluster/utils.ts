import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { ClusterState } from './types';

import { IncompleteResourceError } from '@ez4/aws-common';
import { hashData, toKebabCase } from '@ez4/utils';

import { ClusterDatabaseNotFoundError } from './errors';
import { ClusterServiceType } from './types';

export const createClusterStateId = (clusterName: string) => {
  return hashData(ClusterServiceType, toKebabCase(clusterName));
};

export const isClusterState = (resource: EntryState): resource is ClusterState => {
  return resource.type === ClusterServiceType;
};

export const getClusterState = (context: EventContext, clusterName: string, options: DeployOptions) => {
  const clusterState = context.getServiceState(clusterName, options);

  if (!isClusterState(clusterState)) {
    throw new ClusterDatabaseNotFoundError(clusterName);
  }

  return clusterState;
};

export const getClusterName = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<ClusterState>(ClusterServiceType).at(0)?.parameters;

  if (!resource?.clusterName) {
    throw new IncompleteResourceError(serviceName, resourceId, 'clusterName');
  }

  return resource.clusterName;
};

export const getClusterResult = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<ClusterState>(ClusterServiceType).at(0);

  if (!resource?.result) {
    throw new IncompleteResourceError(serviceName, resourceId, 'result');
  }

  const { clusterArn, secretArn } = resource.result;
  const { clusterName } = resource.parameters;

  return {
    clusterName,
    clusterArn,
    secretArn
  };
};
