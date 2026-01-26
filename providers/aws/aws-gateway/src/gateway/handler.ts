import type { Arn, OperationLogLine } from '@ez4/aws-common';
import type { StepHandler } from '@ez4/stateful';
import type { GatewayState, GatewayResult, GatewayParameters } from './types';

import { applyTagUpdates, CorruptedResourceError, OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { createGateway, deleteCorsConfiguration, deleteGateway, fetchGateway, tagGateway, untagGateway, updateGateway } from './client';
import { GatewayProtocol, GatewayServiceName } from './types';

export const getGatewayHandler = (): StepHandler<GatewayState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: GatewayState, current: GatewayState) => {
  return !!candidate.result && candidate.result.apiId === current.result?.apiId;
};

const previewResource = (candidate: GatewayState, current: GatewayState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.gatewayName ?? source.gatewayName
  };
};

const replaceResource = async (candidate: GatewayState, current: GatewayState) => {
  if (current.result) {
    throw new ReplaceResourceError(GatewayServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = (candidate: GatewayState): Promise<GatewayResult> => {
  const { parameters } = candidate;

  return OperationLogger.logExecution(GatewayServiceName, parameters.gatewayName, 'creation', async (logger) => {
    if (parameters.import) {
      const { apiId, apiArn, endpoint } = await fetchGateway(logger, parameters.gatewayName);

      return {
        apiId,
        apiArn,
        endpoint
      };
    }

    const { apiId, apiArn, endpoint } = await createGateway(logger, candidate.parameters);

    return {
      apiId,
      apiArn,
      endpoint
    };
  });
};

const updateResource = (candidate: GatewayState, current: GatewayState): Promise<GatewayResult> => {
  const { result, parameters } = candidate;
  const { gatewayName } = parameters;

  if (!result) {
    throw new CorruptedResourceError(GatewayServiceName, gatewayName);
  }

  if (parameters.import) {
    return Promise.resolve(result);
  }

  return OperationLogger.logExecution(GatewayServiceName, gatewayName, 'updates', async (logger) => {
    const { apiId, apiArn } = result;

    await checkGeneralUpdates(logger, apiId, parameters, current.parameters);
    await checkTagUpdates(logger, apiArn, parameters, current.parameters);

    return result;
  });
};

const deleteResource = async (current: GatewayState) => {
  const { result, parameters } = current;

  if (!result || parameters.import) {
    return;
  }

  await OperationLogger.logExecution(GatewayServiceName, parameters.gatewayName, 'deletion', async (logger) => {
    await deleteGateway(logger, result.apiId);
  });
};

const checkGeneralUpdates = async (logger: OperationLogLine, apiId: string, candidate: GatewayParameters, current: GatewayParameters) => {
  const hasChanges = !deepEqual(candidate, current, {
    exclude: {
      tags: true
    }
  });

  if (hasChanges) {
    await updateGateway(logger, apiId, candidate);
  }

  if (candidate.protocol === GatewayProtocol.Http && current.protocol === GatewayProtocol.Http && !candidate.cors && current.cors) {
    await deleteCorsConfiguration(logger, apiId);
  }
};

const checkTagUpdates = async (logger: OperationLogLine, apiArn: Arn, candidate: GatewayParameters, current: GatewayParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagGateway(logger, apiArn, tags),
    (tags) => untagGateway(logger, apiArn, tags)
  );
};
