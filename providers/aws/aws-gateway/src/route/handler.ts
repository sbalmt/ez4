import type { StepContext, StepHandler } from '@ez4/stateful';
import type { RouteState, RouteResult, RouteParameters } from './types';

import { Logger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { getGatewayId } from '../gateway/utils';
import { getIntegrationId } from '../integration/utils';
import { tryGetAuthorizerId } from '../authorizer/utils';
import { importRoute, createRoute, deleteRoute, updateRoute } from './client';
import { RouteServiceName } from './types';

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

const previewResource = (candidate: RouteState, current: RouteState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.routePath ?? source.routePath
  };
};

const replaceResource = async (candidate: RouteState, current: RouteState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(RouteServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: RouteState, context: StepContext): Promise<RouteResult> => {
  const { parameters } = candidate;

  return Logger.logOperation(RouteServiceName, parameters.routePath, 'creation', async (logger) => {
    const apiId = getGatewayId(RouteServiceName, 'route', context);
    const integrationId = getIntegrationId(RouteServiceName, 'route', context);
    const authorizerId = tryGetAuthorizerId(context);

    const response =
      (await importRoute(logger, apiId, parameters.routePath)) ??
      (await createRoute(logger, apiId, {
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
  });
};

const updateResource = async (candidate: RouteState, current: RouteState, context: StepContext) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  return Logger.logOperation(RouteServiceName, parameters.routePath, 'updates', async (logger) => {
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

    await checkGeneralUpdates(logger, result.apiId, result.routeId, newRequest, oldRequest);

    return {
      ...result,
      integrationId: newIntegrationId,
      authorizerId: newAuthorizerId
    };
  });
};

const deleteResource = async (current: RouteState) => {
  const { result, parameters } = current;

  if (!result) {
    return;
  }

  return Logger.logOperation(RouteServiceName, parameters.routePath, 'deletion', async (logger) => {
    await deleteRoute(logger, result.apiId, result.routeId);
  });
};

const checkGeneralUpdates = async <T extends RouteParameters>(
  logger: Logger.OperationLogger,
  apiId: string,
  routeId: string,
  candidate: T,
  current: T
) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    await updateRoute(logger, apiId, routeId, candidate);
  }
};
