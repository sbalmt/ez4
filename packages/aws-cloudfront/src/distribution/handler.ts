import type { Arn } from '@ez4/aws-common';
import type { StepContext, StepHandler } from '@ez4/stateful';
import type { DistributionState, DistributionResult, DistributionParameters } from './types.js';
import type { CreateRequest, UpdateRequest } from './client.js';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import {
  createDistribution,
  updateDistribution,
  deleteDistribution,
  tagDistribution,
  untagDistribution
} from './client.js';

import { getOriginPolicyId } from '../origin/utils.js';
import { getOriginAccessId } from '../access/utils.js';
import { getCachePolicyIds } from '../cache/utils.js';
import { tryGetCertificateArn } from '../certificate/utils.js';
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

  const certificateArn = tryGetCertificateArn(context);

  const originPolicyId = getOriginPolicyId(DistributionServiceName, resourceId, context);
  const originAccessId = getOriginAccessId(DistributionServiceName, resourceId, context);
  const cachePolicyIds = getCachePolicyIds(DistributionServiceName, resourceId, context);

  const requestParameters = await bindCachePolicyIds(
    parameters,
    cachePolicyIds,
    originPolicyId,
    context
  );

  const { distributionId, distributionArn, endpoint } = await createDistribution({
    ...requestParameters,
    originAccessId,
    certificateArn
  });

  return {
    distributionId,
    distributionArn,
    certificateArn,
    originPolicyId,
    originAccessId,
    cachePolicyIds,
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

  const newRequestParameters = await bindCachePolicyIds(
    parameters,
    newCachePolicyIds,
    newOriginPolicyId,
    context
  );

  const newRequest = {
    ...newRequestParameters,
    originAccessId: newOriginAccessId,
    certificateArn: newCertificateArn
  };

  const oldRequestParameters = await bindCachePolicyIds(
    current.parameters,
    oldCachePolicyIds,
    oldOriginPolicyId,
    context
  );

  const oldRequest = {
    ...oldRequestParameters,
    originAccessId: oldOriginAccessId,
    certificateArn: oldCertificateArn
  };

  await Promise.all([
    checkGeneralUpdates(result.distributionId, newRequest, oldRequest),
    checkTagUpdates(result.distributionArn, parameters, current.parameters)
  ]);

  return {
    ...result,
    certificateArn: newCertificateArn,
    originPolicyId: newOriginPolicyId,
    originAccessId: newOriginAccessId,
    cachePolicyIds: newCachePolicyIds
  };
};

const deleteResource = async (candidate: DistributionState, context: StepContext) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const { distributionId, originPolicyId, originAccessId, cachePolicyIds } = result;

  // Only disabled distributions can be deleted.
  if (parameters.enabled) {
    const requestParameters = await bindCachePolicyIds(
      parameters,
      cachePolicyIds,
      originPolicyId,
      context
    );

    await updateDistribution(distributionId, {
      ...requestParameters,
      originAccessId,
      enabled: false
    });
  }

  await deleteDistribution(distributionId);
};

const bindCachePolicyIds = async (
  parameters: DistributionParameters,
  cachePolicyIds: string[],
  originPolicyId: string,
  context: StepContext
): Promise<CreateRequest> => {
  const { defaultOrigin, origins } = parameters;

  const [defaultCachePolicyId, ...additionalCachePolicyIds] = cachePolicyIds;

  const defaultDistributionOrigin = await defaultOrigin.getDistributionOrigin(context);

  const additionalDistributionOrigins = await Promise.all(
    (origins ?? []).map(async (additionalOrigin, index) => {
      const cachePolicyId = additionalCachePolicyIds[index] ?? defaultCachePolicyId;

      const distributionOrigin = await additionalOrigin.getDistributionOrigin(context);

      return {
        ...distributionOrigin,
        path: additionalOrigin.path,
        location: additionalOrigin.location,
        id: additionalOrigin.id,
        originPolicyId,
        cachePolicyId
      };
    })
  );

  return {
    ...parameters,
    origins: additionalDistributionOrigins,
    defaultOrigin: {
      ...defaultDistributionOrigin,
      cachePolicyId: defaultCachePolicyId,
      location: defaultOrigin.location,
      id: defaultOrigin.id,
      originPolicyId
    }
  };
};

const checkGeneralUpdates = async (
  distributionId: string,
  candidate: GeneralUpdateParameters,
  current: GeneralUpdateParameters
) => {
  const hasChanges = !deepEqual(candidate, current, {
    exclude: {
      tags: true
    }
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
