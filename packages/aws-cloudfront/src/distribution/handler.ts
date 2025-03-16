import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { CreateRequest, UpdateRequest } from './client.js';

import type {
  DistributionState,
  DistributionResult,
  DistributionParameters,
  DistributionOrigin,
  DistributionDefaultOrigin,
  DistributionAdditionalOrigin
} from './types.js';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { getCachePolicyIds } from '../cache/utils.js';
import { getOriginPolicyId } from '../origin/utils.js';
import { tryGetCertificateArn } from '../certificate/utils.js';
import { getOriginAccessId } from '../access/utils.js';
import { protectHeaders } from './helpers/headers.js';
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
  const target = candidate.parameters;
  const source = current.parameters;

  const [targetDefaultOrigin, ...targetOrigins] = protectOriginHeaders(
    target.origins ? [target.defaultOrigin, ...target.origins] : [target.defaultOrigin]
  );

  const changes = deepCompare(
    {
      ...target,
      dependencies: candidate.dependencies,
      defaultOrigin: targetDefaultOrigin,
      origins: targetOrigins
    },
    {
      ...source,
      dependencies: current.dependencies
    }
  );

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

  const allOriginsData = await getAllOrigins(parameters, context);
  const requestOrigins = bindOriginCachePolices(parameters, allOriginsData, cachePolicyIds, originPolicyId);

  const { distributionId, distributionArn, endpoint } = await createDistribution({
    ...parameters,
    ...requestOrigins,
    originAccessId,
    certificateArn
  });

  lockSensitiveData(candidate);

  const [defaultOrigin, ...origins] = allOriginsData;

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

  const newAllOriginsData = await getAllOrigins(parameters, context);
  const newRequestOrigins = bindOriginCachePolices(parameters, newAllOriginsData, newCachePolicyIds, newOriginPolicyId);

  const newRequest = {
    ...parameters,
    ...newRequestOrigins,
    originAccessId: newOriginAccessId,
    certificateArn: newCertificateArn
  };

  const oldAllOriginsData = [result.defaultOrigin, ...result.origins];
  const oldRequestOrigins = bindOriginCachePolices(current.parameters, oldAllOriginsData, oldCachePolicyIds, oldOriginPolicyId);

  const oldRequest = {
    ...current.parameters,
    ...oldRequestOrigins,
    originAccessId: oldOriginAccessId,
    certificateArn: oldCertificateArn
  };

  await Promise.all([
    checkGeneralUpdates(result.distributionId, newRequest, oldRequest),
    checkTagUpdates(result.distributionArn, parameters, current.parameters)
  ]);

  lockSensitiveData(candidate);

  const [defaultOrigin, ...origins] = newAllOriginsData;

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
    const allOriginsData = [result.defaultOrigin, ...result.origins];
    const requestOrigins = bindOriginCachePolices(parameters, allOriginsData, cachePolicyIds, originPolicyId);

    await updateDistribution(distributionId, {
      ...parameters,
      ...requestOrigins,
      originAccessId,
      enabled: false
    });
  }

  await deleteDistribution(distributionId);
};

const protectOriginHeaders = <T extends (DistributionDefaultOrigin | DistributionAdditionalOrigin)[]>(origins: T) => {
  return origins.map(({ headers, ...origin }) => ({
    ...origin,
    ...(headers && {
      headers: protectHeaders(headers)
    })
  })) as T;
};

const lockSensitiveData = (candidate: DistributionState) => {
  const { parameters } = candidate;

  const [defaultOrigin, ...origins] = protectOriginHeaders(
    parameters.origins ? [parameters.defaultOrigin, ...parameters.origins] : [parameters.defaultOrigin]
  );

  parameters.defaultOrigin = defaultOrigin;

  if (parameters.origins) {
    parameters.origins = origins;
  }

  return candidate;
};

const getAllOrigins = async (parameters: DistributionParameters, context: StepContext) => {
  const defaultOrigin = await parameters.defaultOrigin.getDistributionOrigin(context);

  const origins = await Promise.all(
    (parameters.origins ?? []).map((additionalOrigin) => {
      return additionalOrigin.getDistributionOrigin(context);
    })
  );

  return [defaultOrigin, ...origins];
};

const bindOriginCachePolices = (
  parameters: DistributionParameters,
  allOrigins: DistributionOrigin[],
  allCachePolicyIds: string[],
  originPolicyId: string
) => {
  const [defaultCachePolicyId, ...additionalCachePolicyIds] = allCachePolicyIds;
  const [defaultOriginData, ...additionalOriginsData] = allOrigins;

  const defaultOrigin = {
    ...parameters.defaultOrigin,
    ...defaultOriginData,
    cachePolicyId: defaultCachePolicyId,
    originPolicyId
  };

  const origins = parameters.origins?.map((additionalOrigin, index) => {
    const cachePolicyId = additionalCachePolicyIds[index] ?? defaultCachePolicyId;

    return {
      ...additionalOrigin,
      ...additionalOriginsData[index],
      originPolicyId,
      cachePolicyId
    };
  });

  return {
    defaultOrigin,
    origins
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
