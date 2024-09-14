import type { Arn } from '@ez4/aws-common';
import type { StepHandler } from '@ez4/stateful';
import type { DistributionState, DistributionResult, DistributionParameters } from './types.js';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import {
  createDistribution,
  updateDistribution,
  deleteDistribution,
  tagDistribution,
  untagDistribution
} from './client.js';

import { DistributionServiceName } from './types.js';

export const getDistributionHandler = (): StepHandler<DistributionState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: DistributionState, current: DistributionState) => {
  return !!candidate.result && candidate.result.distributionId === current.result?.distributionId;
};

const previewResource = async (candidate: DistributionState, current: DistributionState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.distributionName
  };
};

const replaceResource = async (candidate: DistributionState, current: DistributionState) => {
  if (current.result) {
    throw new ReplaceResourceError(DistributionServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: DistributionState): Promise<DistributionResult> => {
  const response = await createDistribution(candidate.parameters);

  const { distributionId, distributionArn, endpoint, version } = response;

  return {
    distributionId,
    distributionArn,
    endpoint,
    version
  };
};

const updateResource = async (candidate: DistributionState, current: DistributionState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const newResult = await checkGeneralUpdates(result, parameters, current.parameters);

  await checkTagUpdates(result.distributionArn, parameters, current.parameters);

  return newResult;
};

const deleteResource = async (candidate: DistributionState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const { distributionId, version } = result;

  if (!parameters.enabled) {
    return deleteDistribution(distributionId, version);
  }

  // Only disabled distributions can be deleted.
  const newResult = await updateDistribution(distributionId, version, {
    ...parameters,
    enabled: false
  });

  await deleteDistribution(distributionId, newResult.version);
};

const checkGeneralUpdates = async (
  result: DistributionResult,
  candidate: DistributionParameters,
  current: DistributionParameters
) => {
  const hasChanges = !deepEqual(candidate, current, {
    tags: true
  });

  if (hasChanges) {
    return updateDistribution(result.distributionId, result.version, candidate);
  }

  return result;
};

const checkTagUpdates = async (
  distributionArn: Arn,
  candidate: DistributionParameters,
  current: DistributionParameters
) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagDistribution(distributionArn, tags),
    (tags) => untagDistribution(distributionArn, tags)
  );
};
