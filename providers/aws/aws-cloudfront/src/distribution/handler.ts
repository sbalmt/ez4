import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Arn, OperationLogLine } from '@ez4/aws-common';
import type { CreateRequest, UpdateRequest } from './client';

import type {
  DistributionState,
  DistributionResult,
  DistributionParameters,
  DistributionOrigin,
  DistributionDefaultOrigin,
  DistributionAdditionalOrigin
} from './types';

import { applyTagUpdates, OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { getOriginAccessId } from '../access/utils';
import { tryGetCertificateArn } from '../certificate/utils';
import { createDistribution, updateDistribution, deleteDistribution, tagDistribution, untagDistribution } from './client';
import { protectHeaders } from './helpers/headers';
import { DistributionServiceName } from './types';

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

const previewResource = (candidate: DistributionState, current: DistributionState) => {
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

const createResource = (candidate: DistributionState, context: StepContext): Promise<DistributionResult> => {
  const parameters = candidate.parameters;

  const distributionName = parameters.distributionName;

  return OperationLogger.logExecution(DistributionServiceName, distributionName, 'creation', async (logger) => {
    const certificateArn = tryGetCertificateArn(context);
    const originAccessId = getOriginAccessId(DistributionServiceName, distributionName, context);

    const originsData = await getOriginsData(parameters, context);
    const allOrigins = bindOriginsData(parameters, originsData);

    const { distributionId, distributionArn, endpoint } = await createDistribution(logger, {
      ...parameters,
      ...allOrigins,
      originAccessId,
      certificateArn
    });

    lockSensitiveData(candidate);

    const [defaultOrigin, ...origins] = originsData;

    return {
      endpoint,
      distributionId,
      distributionArn,
      certificateArn,
      originAccessId,
      defaultOrigin,
      origins
    };
  });
};

const updateResource = (
  candidate: DistributionState,
  current: DistributionState,
  context: StepContext
): Promise<DistributionResult | void> => {
  const { result, parameters } = candidate;

  if (!result) {
    return Promise.resolve(undefined);
  }

  const distributionName = parameters.distributionName;

  return OperationLogger.logExecution(DistributionServiceName, distributionName, 'updates', async (logger) => {
    const newCertificateArn = tryGetCertificateArn(context);
    const oldCertificateArn = current.result?.certificateArn;

    const newOriginAccessId = getOriginAccessId(DistributionServiceName, distributionName, context);
    const oldOriginAccessId = current.result?.originAccessId ?? newOriginAccessId;

    const newOriginsData = await getOriginsData(parameters, context);
    const newAllOrigins = bindOriginsData(parameters, newOriginsData);

    const newRequest = {
      ...parameters,
      ...newAllOrigins,
      originAccessId: newOriginAccessId,
      certificateArn: newCertificateArn
    };

    const oldOriginsData = [result.defaultOrigin, ...result.origins];
    const oldAllOrigins = bindOriginsData(current.parameters, oldOriginsData);

    const oldRequest = {
      ...current.parameters,
      ...oldAllOrigins,
      originAccessId: oldOriginAccessId,
      certificateArn: oldCertificateArn
    };

    await checkGeneralUpdates(logger, result.distributionId, newRequest, oldRequest);
    await checkTagUpdates(logger, result.distributionArn, parameters, current.parameters);

    lockSensitiveData(candidate);

    const [defaultOrigin, ...origins] = newOriginsData;

    return {
      ...result,
      certificateArn: newCertificateArn,
      originAccessId: newOriginAccessId,
      defaultOrigin,
      origins
    };
  });
};

const deleteResource = async (current: DistributionState) => {
  const { result, parameters } = current;

  if (!result) {
    return;
  }

  const { distributionName } = parameters;

  await OperationLogger.logExecution(DistributionServiceName, distributionName, 'deletion', async (logger) => {
    const { distributionId, originAccessId } = result;

    // Only disabled distributions can be deleted.
    if (parameters.enabled) {
      const originsData = [result.defaultOrigin, ...result.origins];
      const allOrigins = bindOriginsData(parameters, originsData);

      await updateDistribution(logger, distributionId, {
        ...parameters,
        ...allOrigins,
        originAccessId,
        enabled: false
      });
    }

    await deleteDistribution(logger, distributionId);
  });
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

const getOriginsData = async (parameters: DistributionParameters, context: StepContext) => {
  const { defaultOrigin, origins = [] } = parameters;

  return Promise.all([
    defaultOrigin.getDistributionOrigin(context),
    ...origins.map((additionalOrigin) => additionalOrigin.getDistributionOrigin(context))
  ]);
};

const bindOriginsData = (parameters: DistributionParameters, originsData: DistributionOrigin[]) => {
  const [defaultOriginData, ...additionalOriginsData] = originsData;

  const defaultOrigin = {
    ...parameters.defaultOrigin,
    ...defaultOriginData
  };

  const origins = parameters.origins?.map((additionalOrigin, index) => {
    return {
      ...additionalOrigin,
      ...additionalOriginsData[index]
    };
  });

  return {
    defaultOrigin,
    origins
  };
};

const checkGeneralUpdates = async (
  logger: OperationLogLine,
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
    await updateDistribution(logger, distributionId, candidate);
  }
};

const checkTagUpdates = async (
  logger: OperationLogLine,
  distributionArn: Arn,
  candidate: DistributionParameters,
  current: DistributionParameters
) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagDistribution(logger, distributionArn, tags),
    (tags) => untagDistribution(logger, distributionArn, tags)
  );
};
