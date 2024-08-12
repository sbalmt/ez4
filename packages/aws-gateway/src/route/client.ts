import type { Arn } from '@ez4/aws-common';

import {
  ApiGatewayV2Client,
  CreateRouteCommand,
  DeleteRouteCommand,
  UpdateRouteCommand
} from '@aws-sdk/client-apigatewayv2';

import { Logger } from '@ez4/aws-common';

import { RouteServiceName } from './types.js';

const client = new ApiGatewayV2Client({});

export type CreateRequest = {
  routePath: string;
  integrationId: string;
  operationName?: string;
};

export type CreateResponse = {
  routeId: string;
  routeArn: Arn;
};

export type UpdateRequest = Partial<CreateRequest>;

export const createRoute = async (
  apiId: string,
  request: CreateRequest
): Promise<CreateResponse> => {
  Logger.logCreate(RouteServiceName, request.routePath);

  const [region, response] = await Promise.all([
    client.config.region(),
    client.send(
      new CreateRouteCommand({
        ApiId: apiId,
        RouteKey: request.routePath,
        OperationName: request.operationName,
        Target: `integrations/${request.integrationId}`
      })
    )
  ]);

  return {
    routeId: response.RouteId!,
    routeArn: `arn:aws:apigateway:${region}::/apis/${apiId}/routes/${response.RouteId}` as Arn
  };
};

export const updateRoute = async (apiId: string, routeId: string, request: UpdateRequest) => {
  Logger.logUpdate(RouteServiceName, routeId);

  const { integrationId, operationName, routePath } = request;

  await client.send(
    new UpdateRouteCommand({
      ApiId: apiId,
      RouteId: routeId,
      OperationName: operationName,
      RouteKey: routePath,
      ...(integrationId && { Target: `integrations/${integrationId}` })
    })
  );
};

export const deleteRoute = async (apiId: string, routeId: string) => {
  Logger.logDelete(RouteServiceName, routeId);

  await client.send(
    new DeleteRouteCommand({
      ApiId: apiId,
      RouteId: routeId
    })
  );
};
