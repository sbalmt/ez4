import type { Arn } from '@ez4/aws-common';
import type { StepContext, StepHandler } from '@ez4/stateful';
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

import { getCachePolicyId } from '../policy/utils.js';
import { getOriginAccessId } from '../access/utils.js';
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

const replaceResource = async (
  candidate: DistributionState,
  current: DistributionState,
  context: StepContext
) => {
  if (current.result) {
    throw new ReplaceResourceError(DistributionServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (
  candidate: DistributionState,
  context: StepContext
): Promise<DistributionResult> => {
  const parameters = candidate.parameters;
  const resourceId = parameters.distributionName;

  const originAccessId = getOriginAccessId(DistributionServiceName, resourceId, context);
  const cachePolicyId = getCachePolicyId(DistributionServiceName, resourceId, context);

  const { distributionId, distributionArn, endpoint } = await createDistribution({
    ...parameters,
    defaultAccessId: originAccessId,
    defaultPolicyId: cachePolicyId
  });

  return {
    distributionId,
    distributionArn,
    originAccessId,
    cachePolicyId,
    endpoint
  };
};

const updateResource = async (
  candidate: DistributionState,
  current: DistributionState,
  context: StepContext
): Promise<DistributionResult | void> => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const resourceId = parameters.distributionName;

  const newOriginAccessId = getOriginAccessId(DistributionServiceName, resourceId, context);
  const oldOriginAccessId = current.result?.originAccessId ?? newOriginAccessId;

  const newCachePolicyId = getCachePolicyId(DistributionServiceName, resourceId, context);
  const oldCachePolicyId = current.result?.cachePolicyId ?? newCachePolicyId;

  const newRequest = {
    ...parameters,
    defaultAccessId: newOriginAccessId,
    defaultPolicyId: newCachePolicyId
  };

  const oldRequest = {
    ...current.parameters,
    defaultAccessId: oldOriginAccessId,
    defaultPolicyId: oldCachePolicyId
  };

  await checkGeneralUpdates(result.distributionId, newRequest, oldRequest);
  await checkTagUpdates(result.distributionArn, parameters, current.parameters);

  return {
    ...result,
    originAccessId: newOriginAccessId,
    cachePolicyId: newCachePolicyId
  };
};

const deleteResource = async (candidate: DistributionState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const { distributionId, originAccessId, cachePolicyId } = result;

  // Only disabled distributions can be deleted.
  if (parameters.enabled) {
    await updateDistribution(distributionId, {
      ...parameters,
      defaultAccessId: originAccessId,
      defaultPolicyId: cachePolicyId,
      enabled: false
    });
  }

  await deleteDistribution(distributionId);
};

const checkGeneralUpdates = async <T extends DistributionParameters>(
  distributionId: string,
  candidate: T,
  current: T
) => {
  const hasChanges = !deepEqual(candidate, current, {
    tags: true
  });

  if (hasChanges) {
    await updateDistribution(distributionId, candidate);
  }
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
