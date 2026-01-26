import type { StepContext, StepHandler } from '@ez4/stateful';
import type { OperationLogLine } from '@ez4/aws-common';
import type { ResponseState, ResponseResult, ResponseParameters } from './types';

import { OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { getRouteId } from '../route/utils';
import { getGatewayId } from '../gateway/utils';
import { createResponse, deleteResponse, updateResponse } from './client';
import { ResponseServiceName } from './types';

export const getResponseHandler = (): StepHandler<ResponseState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: ResponseState, current: ResponseState) => {
  return !!candidate.result && candidate.result.responseId === current.result?.responseId;
};

const previewResource = (candidate: ResponseState, current: ResponseState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.responseKey ?? source.responseKey
  };
};

const replaceResource = async (candidate: ResponseState, current: ResponseState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(ResponseServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = (candidate: ResponseState, context: StepContext): Promise<ResponseResult> => {
  const { parameters } = candidate;

  return OperationLogger.logExecution(ResponseServiceName, parameters.responseKey, 'creation', async (logger) => {
    const routeId = getRouteId(ResponseServiceName, 'response', context);
    const apiId = getGatewayId(ResponseServiceName, 'response', context);

    const { responseId } = await createResponse(logger, apiId, routeId, parameters);

    return {
      responseId,
      routeId,
      apiId
    };
  });
};

const updateResource = (candidate: ResponseState, current: ResponseState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  return OperationLogger.logExecution(ResponseServiceName, parameters.responseKey, 'updates', async (logger) => {
    await checkGeneralUpdates(logger, result.apiId, result.routeId, result.responseId, candidate.parameters, current.parameters);
  });
};

const deleteResource = async (current: ResponseState) => {
  const { result, parameters } = current;

  if (!result) {
    return;
  }

  await OperationLogger.logExecution(ResponseServiceName, parameters.responseKey, 'deletion', async (logger) => {
    await deleteResponse(logger, result.apiId, result.routeId, result.responseId);
  });
};

const checkGeneralUpdates = async <T extends ResponseParameters>(
  logger: OperationLogLine,
  apiId: string,
  routeId: string,
  responseId: string,
  candidate: T,
  current: T
) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    await updateResponse(logger, apiId, routeId, responseId, candidate);
  }
};
