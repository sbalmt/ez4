import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { CreateRequest, UpdateRequest } from './client.js';
import type { DistributionState, DistributionResult, DistributionParameters, DistributionOrigin } from './types.js';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { getCachePolicyIds } from '../cache/utils.js';
import { getOriginPolicyId } from '../origin/utils.js';
import { getOriginAccessId } from '../access/utils.js';
import { tryGetCertificateArn } from '../certificate/utils.js';
import { createDistribution, updateDistribution, deleteDistribution, tagDistribution, untagDistribution } from './client.js';
import { DistributionServiceName } from './types.js';

type GeneralUpdateParameters = CreateRequest & UpdateRequest;

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

const replaceResource = async (candidate: DistributionState, current: DistributionState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(DistributionServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: DistributionState, context: StepContext): Promise<DistributionResult> => {
  const parameters = candidate.parameters;
  const resourceId = parameters.distributionName;

  const certificateArn = tryGetCertificateArn(context);

  const originPolicyId = getOriginPolicyId(DistributionServiceName, resourceId, context);
  const originAccessId = getOriginAccessId(DistributionServiceName, resourceId, context);
  const cachePolicyIds = getCachePolicyIds(DistributionServiceName, resourceId, context);

  const allOrigins = await getAllOrigins(parameters, context);

  const requestOrigins = bindOriginCachePolices(parameters, allOrigins, cachePolicyIds, originPolicyId);

  const { distributionId, distributionArn, endpoint } = await createDistribution({
    ...parameters,
    ...requestOrigins,
    originAccessId,
    certificateArn
  });

  const [defaultOrigin, ...origins] = allOrigins;

  return {
    distributionId,
    distributionArn,
    certificateArn,
    originPolicyId,
    originAccessId,
    cachePolicyIds,
    defaultOrigin,
    origins,
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

  const newCertificateArn = tryGetCertificateArn(context);
  const oldCertificateArn = current.result?.certificateArn;

  const newOriginPolicyId = getOriginPolicyId(DistributionServiceName, resourceId, context);
  const oldOriginPolicyId = current.result?.originAccessId ?? newOriginPolicyId;

  const newOriginAccessId = getOriginAccessId(DistributionServiceName, resourceId, context);
  const oldOriginAccessId = current.result?.originAccessId ?? newOriginAccessId;

  const newCachePolicyIds = getCachePolicyIds(DistributionServiceName, resourceId, context);
  const oldCachePolicyIds = current.result?.cachePolicyIds ?? newCachePolicyIds;

  const newAllOrigins = await getAllOrigins(parameters, context);

  const newRequestOrigins = bindOriginCachePolices(parameters, newAllOrigins, newCachePolicyIds, newOriginPolicyId);

  const newRequest = {
    ...parameters,
    ...newRequestOrigins,
    originAccessId: newOriginAccessId,
    certificateArn: newCertificateArn
  };

  const oldAllOrigins = [result.defaultOrigin, ...result.origins];

  const oldRequestParameters = bindOriginCachePolices(current.parameters, oldAllOrigins, oldCachePolicyIds, oldOriginPolicyId);

  const oldRequest = {
    ...current.parameters,
    ...oldRequestParameters,
    originAccessId: oldOriginAccessId,
    certificateArn: oldCertificateArn
  };

  await Promise.all([
    checkGeneralUpdates(result.distributionId, newRequest, oldRequest),
    checkTagUpdates(result.distributionArn, parameters, current.parameters)
  ]);

  const [defaultOrigin, ...origins] = newAllOrigins;

  return {
    ...result,
    certificateArn: newCertificateArn,
    originPolicyId: newOriginPolicyId,
    originAccessId: newOriginAccessId,
    cachePolicyIds: newCachePolicyIds,
    defaultOrigin,
    origins
  };
};

const deleteResource = async (candidate: DistributionState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const { distributionId, originPolicyId, originAccessId, cachePolicyIds } = result;

  // Only disabled distributions can be deleted.
  if (parameters.enabled) {
    const requestOrigins = bindOriginCachePolices(parameters, [result.defaultOrigin, ...result.origins], cachePolicyIds, originPolicyId);

    await updateDistribution(distributionId, {
      ...parameters,
      ...requestOrigins,
      originAccessId,
      enabled: false
    });
  }

  await deleteDistribution(distributionId);
};

const getAllOrigins = async (parameters: DistributionParameters, context: StepContext) => {
  const defaultOrigin = await parameters.defaultOrigin.getDistributionOrigin(context);

  const origins = await Promise.all((parameters.origins ?? []).map((additionalOrigin) => additionalOrigin.getDistributionOrigin(context)));

  return [defaultOrigin, ...origins];
};

const bindOriginCachePolices = (
  parameters: DistributionParameters,
  allOrigins: DistributionOrigin[],
  allCachePolicyIds: string[],
  originPolicyId: string
) => {
  const [defaultOrigin, ...additionalOrigins] = allOrigins;

  const [defaultCachePolicyId, ...additionalCachePolicyIds] = allCachePolicyIds;

  const origins = parameters.origins?.map(({ id, path, location }, index) => {
    const cachePolicyId = additionalCachePolicyIds[index] ?? defaultCachePolicyId;

    return {
      ...additionalOrigins[index],
      originPolicyId,
      cachePolicyId,
      location,
      path,
      id
    };
  });

  return {
    origins,
    defaultOrigin: {
      ...defaultOrigin,
      id: parameters.defaultOrigin.id,
      location: parameters.defaultOrigin.location,
      cachePolicyId: defaultCachePolicyId,
      originPolicyId
    }
  };
};

const checkGeneralUpdates = async (distributionId: string, candidate: GeneralUpdateParameters, current: GeneralUpdateParameters) => {
  const hasChanges = !deepEqual(candidate, current, {
    exclude: {
      tags: true
    }
  });

  if (hasChanges) {
    await updateDistribution(distributionId, candidate);
  }
};

const checkTagUpdates = async (distributionArn: Arn, candidate: DistributionParameters, current: DistributionParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagDistribution(distributionArn, tags),
    (tags) => untagDistribution(distributionArn, tags)
  );
};
