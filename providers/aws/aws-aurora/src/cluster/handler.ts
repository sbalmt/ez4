import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { ClusterState, ClusterResult, ClusterParameters } from './types';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { importCluster, createCluster, updateCluster, deleteCluster, tagCluster, untagCluster, updateDeletion } from './client';
import { ClusterServiceName } from './types';

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
  const { clusterName } = candidate.parameters;

  const response = (await importCluster(clusterName)) ?? (await createCluster(candidate.parameters));

  const { clusterArn, writerEndpoint, readerEndpoint, secretArn } = response;

  return {
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

  const { clusterName } = parameters;

  const newResult = await checkGeneralUpdates(clusterName, result, parameters, current.parameters);

  await checkDeletionUpdates(clusterName, parameters, current.parameters);
  await checkTagUpdates(result.clusterArn, parameters, current.parameters);

  return newResult;
};

const deleteResource = async (candidate: ClusterState, context: StepContext) => {
  const { result, parameters } = candidate;

  const allowDeletion = !!parameters.allowDeletion;

  if (!result || (!allowDeletion && !context.force)) {
    return;
  }

  if (!allowDeletion) {
    await updateDeletion(parameters.clusterName, true);
  }

  await deleteCluster(parameters.clusterName);
};

const checkDeletionUpdates = async (clusterName: string, candidate: ClusterParameters, current: ClusterParameters) => {
  const allowDeletion = !!candidate.allowDeletion;

  if (allowDeletion !== !!current.allowDeletion) {
    await updateDeletion(clusterName, allowDeletion);
  }
};

const checkGeneralUpdates = async (
  clusterName: string,
  result: ClusterResult,
  candidate: ClusterParameters,
  current: ClusterParameters
) => {
  const hasChanges = !deepEqual(candidate, current, {
    exclude: {
      clusterName: true,
      tags: true
    }
  });

  if (hasChanges) {
    return updateCluster(clusterName, candidate);
  }

  return result;
};

const checkTagUpdates = async (clusterArn: Arn, candidate: ClusterParameters, current: ClusterParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagCluster(clusterArn, tags),
    (tags) => untagCluster(clusterArn, tags)
  );
};
