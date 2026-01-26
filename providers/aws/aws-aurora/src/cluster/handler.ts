import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Arn, OperationLogLine } from '@ez4/aws-common';
import type { ClusterState, ClusterResult, ClusterParameters } from './types';

import { applyTagUpdates, CorruptedResourceError, OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
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

const previewResource = (candidate: ClusterState, current: ClusterState) => {
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

const createResource = (candidate: ClusterState): Promise<ClusterResult> => {
  const { clusterName } = candidate.parameters;

  return OperationLogger.logExecution(ClusterServiceName, clusterName, 'creation', async (logger) => {
    const response = (await importCluster(logger, clusterName)) ?? (await createCluster(logger, candidate.parameters));

    const { clusterArn, writerEndpoint, readerEndpoint, secretArn } = response;

    return {
      clusterArn,
      writerEndpoint,
      readerEndpoint,
      secretArn
    };
  });
};

const updateResource = (candidate: ClusterState, current: ClusterState): Promise<ClusterResult> => {
  const { result, parameters } = candidate;
  const { clusterName } = parameters;

  if (!result) {
    throw new CorruptedResourceError(ClusterServiceName, clusterName);
  }

  return OperationLogger.logExecution(ClusterServiceName, clusterName, 'updates', async (logger) => {
    const newResult = await checkGeneralUpdates(logger, clusterName, result, parameters, current.parameters);

    await checkDeletionUpdates(logger, clusterName, parameters, current.parameters);
    await checkTagUpdates(logger, result.clusterArn, parameters, current.parameters);

    return newResult;
  });
};

const deleteResource = async (current: ClusterState, context: StepContext) => {
  const { result, parameters } = current;

  const allowDeletion = !!parameters.allowDeletion;

  if (!result || (!allowDeletion && !context.force)) {
    return;
  }

  const clusterName = parameters.clusterName;

  await OperationLogger.logExecution(ClusterServiceName, clusterName, 'deletion', async (logger) => {
    if (!allowDeletion) {
      await updateDeletion(logger, clusterName, true);
    }

    await deleteCluster(logger, clusterName);
  });
};

const checkDeletionUpdates = async (
  logger: OperationLogLine,
  clusterName: string,
  candidate: ClusterParameters,
  current: ClusterParameters
) => {
  const allowDeletion = !!candidate.allowDeletion;

  if (allowDeletion !== !!current.allowDeletion) {
    await updateDeletion(logger, clusterName, allowDeletion);
  }
};

const checkGeneralUpdates = async (
  logger: OperationLogLine,
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
    return updateCluster(logger, clusterName, candidate);
  }

  return result;
};

const checkTagUpdates = async (logger: OperationLogLine, clusterArn: Arn, candidate: ClusterParameters, current: ClusterParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagCluster(logger, clusterArn, tags),
    (tags) => untagCluster(logger, clusterArn, tags)
  );
};
