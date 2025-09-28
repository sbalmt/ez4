import type { Arn } from '@ez4/aws-common';

import {
  ApiGatewayV2Client,
  GetRoutesCommand,
  CreateRouteCommand,
  UpdateRouteCommand,
  DeleteRouteCommand,
  AuthorizationType,
  NotFoundException
} from '@aws-sdk/client-apigatewayv2';

import { Logger, waitCreation, waitDeletion } from '@ez4/aws-common';

import { RouteServiceName } from './types';

const client = new ApiGatewayV2Client({});

export type CreateRequest = {
  routePath: string;
  integrationId: string;
  operationName?: string;
  authorizerId?: string;
};

export type ImportOrCreateResponse = {
  routeId: string;
  routeArn: Arn;
};

export type UpdateRequest = Partial<CreateRequest>;

export const importRoute = async (apiId: string, routePath: string): Promise<ImportOrCreateResponse | undefined> => {
  Logger.logImport(RouteServiceName, routePath);

  const response = await client.send(
    new GetRoutesCommand({
      ApiId: apiId,
      MaxResults: '300'
    })
  );

  const route = response.Items?.find((route) => route.RouteKey === routePath);

  if (!route) {
    return undefined;
  }

  const routeId = route.RouteId!;
  const routeArn = await getRouteArn(apiId, routeId);

  return {
    routeArn,
    routeId
  };
};

export const createRoute = async (apiId: string, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  Logger.logCreate(RouteServiceName, request.routePath);

  const { integrationId, authorizerId, operationName, routePath } = request;

  // If the multiple routes being created triggers the conflict error,
  // keep retrying until max attempts.
  const response = await waitCreation(() => {
    return client.send(
      new CreateRouteCommand({
        ApiId: apiId,
        RouteKey: routePath,
        OperationName: operationName,
        Target: `integrations/${integrationId}`,
        ...(authorizerId && {
          AuthorizationType: AuthorizationType.CUSTOM,
          AuthorizerId: authorizerId
        })
      })
    );
  });

  const routeId = response.RouteId!;
  const routeArn = await getRouteArn(apiId, routeId);

  return {
    routeArn,
    routeId
  };
};

export const updateRoute = async (apiId: string, routeId: string, request: UpdateRequest) => {
  const { integrationId, authorizerId, operationName, routePath } = request;

  Logger.logUpdate(RouteServiceName, `${routeId} ${routePath}`);

  const authorizationType = authorizerId ? AuthorizationType.CUSTOM : AuthorizationType.NONE;

  await client.send(
    new UpdateRouteCommand({
      ApiId: apiId,
      RouteId: routeId,
      RouteKey: routePath,
      OperationName: operationName,
      AuthorizationType: authorizationType,
      AuthorizerId: authorizerId,
      ...(integrationId && {
        Target: `integrations/${integrationId}`
      })
    })
  );
};

export const deleteRoute = async (apiId: string, routeId: string) => {
  Logger.logDelete(RouteServiceName, routeId);

  // If the multiple routes being deleted triggers the conflict error,
  // keep retrying until max attempts.
  await waitDeletion(async () => {
    try {
      await client.send(
        new DeleteRouteCommand({
          ApiId: apiId,
          RouteId: routeId
        })
      );
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }
  });
};

const getRouteArn = async (apiId: string, routeId: string) => {
  const region = await client.config.region();

  return `arn:aws:apigateway:${region}::/apis/${apiId}/routes/${routeId}` as Arn;
};
