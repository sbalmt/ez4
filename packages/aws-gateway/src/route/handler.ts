import type { StepContext, StepHandler } from '@ez4/stateful';
import type { RouteState, RouteResult, RouteParameters } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { getGatewayId } from '../gateway/utils.js';
import { getIntegrationId } from '../integration/utils.js';
import { tryGetAuthorizerId } from '../authorizer/utils.js';
import { importRoute, createRoute, deleteRoute, updateRoute } from './client.js';
import { RouteServiceName } from './types.js';

export const getRouteHandler = (): StepHandler<RouteState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: RouteState, current: RouteState) => {
  return !!candidate.result && candidate.result.routeId === current.result?.routeId;
};

const previewResource = async (candidate: RouteState, current: RouteState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  return changes.counts ? changes : undefined;
};

const replaceResource = async (candidate: RouteState, current: RouteState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(RouteServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: RouteState, context: StepContext): Promise<RouteResult> => {
  const parameters = candidate.parameters;

  const authorizerId = tryGetAuthorizerId(context);
  const integrationId = getIntegrationId(RouteServiceName, 'route', context);
  const apiId = getGatewayId(RouteServiceName, 'route', context);

  const response =
    (await importRoute(apiId, parameters.routePath)) ??
    (await createRoute(apiId, {
      ...parameters,
      integrationId,
      authorizerId
    }));

  return {
    routeId: response.routeId,
    routeArn: response.routeArn,
    integrationId,
    authorizerId,
    apiId
  };
};

const updateResource = async (candidate: RouteState, current: RouteState, context: StepContext) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  const newAuthorizerId = tryGetAuthorizerId(context);
  const oldAuthorizerId = current.result?.authorizerId;

  const newIntegrationId = getIntegrationId(RouteServiceName, result.routeId, context);
  const oldIntegrationId = current.result?.integrationId ?? newIntegrationId;

  const newRequest = {
    ...candidate.parameters,
    integrationId: newIntegrationId,
    authorizerId: newAuthorizerId
  };

  const oldRequest = {
    ...current.parameters,
    integrationId: oldIntegrationId,
    authorizerId: oldAuthorizerId
  };

  await checkGeneralUpdates(result.apiId, result.routeId, newRequest, oldRequest);

  return {
    ...result,
    integrationId: newIntegrationId,
    authorizerId: newAuthorizerId
  };
};

const deleteResource = async (candidate: RouteState) => {
  const result = candidate.result;

  if (result) {
    await deleteRoute(result.apiId, result.routeId);
  }
};

const checkGeneralUpdates = async <T extends RouteParameters>(apiId: string, routeId: string, candidate: T, current: T) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    await updateRoute(apiId, routeId, candidate);
  }
};
