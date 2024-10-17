import type { Arn } from '@ez4/aws-common';
import type { StepHandler } from '@ez4/stateful';
import type { ClusterState, ClusterResult, ClusterParameters } from './types.js';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { createCluster, updateCluster, deleteCluster, tagCluster, untagCluster } from './client.js';

import { ClusterServiceName } from './types.js';

export const getClusterHandler = (): StepHandler<ClusterState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: ClusterState, current: ClusterState) => {
  return !!candidate.result && candidate.result.clusterArn === current.result?.clusterArn;
};

const previewResource = async (candidate: ClusterState, current: ClusterState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.clusterName
  };
};

const replaceResource = async (candidate: ClusterState, current: ClusterState) => {
  if (current.result) {
    throw new ReplaceResourceError(ClusterServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: ClusterState): Promise<ClusterResult> => {
  const response = await createCluster(candidate.parameters);

  const { clusterName, clusterArn, writerEndpoint, readerEndpoint, secretArn } = response;

  return {
    clusterName,
    clusterArn,
    writerEndpoint,
    readerEndpoint,
    secretArn
  };
};

const updateResource = async (candidate: ClusterState, current: ClusterState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const [newResult] = await Promise.all([
    checkGeneralUpdates(result, parameters, current.parameters),
    checkTagUpdates(result.clusterArn, parameters, current.parameters)
  ]);

  return newResult;
};

const deleteResource = async (candidate: ClusterState) => {
  const { result, parameters } = candidate;

  if (!result || !parameters.allowDeletion) {
    return;
  }

  await deleteCluster(result.clusterName);
};

const checkGeneralUpdates = async (
  result: ClusterResult,
  candidate: ClusterParameters,
  current: ClusterParameters
) => {
  const hasChanges = !deepEqual(candidate, current, {
    clusterName: true,
    tags: true
  });

  if (hasChanges) {
    return updateCluster(result.clusterName, candidate);
  }

  return result;
};

const checkTagUpdates = async (
  clusterArn: Arn,
  candidate: ClusterParameters,
  current: ClusterParameters
) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagCluster(clusterArn, tags),
    (tags) => untagCluster(clusterArn, tags)
  );
};
