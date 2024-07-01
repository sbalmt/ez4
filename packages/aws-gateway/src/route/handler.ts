import type { StepContext, StepHandler } from '@ez4/stateful';
import type { RouteState, RouteResult, RouteParameters } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepEqual } from '@ez4/utils';

import { getGatewayId } from '../gateway/utils.js';
import { getIntegrationId } from '../integration/utils.js';
import { createRoute, deleteRoute, updateRoute } from './client.js';
import { RouteServiceName } from './types.js';

export const getRouteHandler = (): StepHandler<RouteState> => ({
  equals: equalsResource,
  replace: replaceResource,
  create: createResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: RouteState, current: RouteState) => {
  return !!candidate.result && candidate.result.routeId === current.result?.routeId;
};

const replaceResource = async (
  candidate: RouteState,
  current: RouteState,
  context: StepContext
) => {
  if (current.result) {
    throw new ReplaceResourceError(RouteServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (
  candidate: RouteState,
  context: StepContext
): Promise<RouteResult> => {
  const integrationId = getIntegrationId(RouteServiceName, 'route', context);
  const apiId = getGatewayId(RouteServiceName, 'route', context);

  const response = await createRoute(apiId, {
    ...candidate.parameters,
    integrationId
  });

  return {
    routeId: response.routeId,
    routeArn: response.routeArn,
    integrationId,
    apiId
  };
};

const updateResource = async (candidate: RouteState, current: RouteState, context: StepContext) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  const newIntegrationId = getIntegrationId(RouteServiceName, result.routeId, context);
  const oldIntegrationId = current.result?.integrationId ?? newIntegrationId;

  const newRequest = { ...candidate.parameters, integrationId: newIntegrationId };
  const oldRequest = { ...current.parameters, integrationId: oldIntegrationId };

  await checkGeneralUpdates(result.apiId, result.routeId, newRequest, oldRequest);

  return {
    ...result,
    integrationId: newIntegrationId
  };
};

const deleteResource = async (candidate: RouteState) => {
  const result = candidate.result;

  if (result) {
    await deleteRoute(result.apiId, result.routeId);
  }
};

const checkGeneralUpdates = async <T extends RouteParameters>(
  apiId: string,
  integrationId: string,
  candidate: T,
  current: T
) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    await updateRoute(apiId, integrationId, candidate);
  }
};
