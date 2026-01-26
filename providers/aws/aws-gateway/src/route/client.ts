import type { ApiGatewayV2Client } from '@aws-sdk/client-apigatewayv2';
import type { Arn, OperationLogLine } from '@ez4/aws-common';

import {
  GetRoutesCommand,
  CreateRouteCommand,
  UpdateRouteCommand,
  DeleteRouteCommand,
  AuthorizationType,
  NotFoundException
} from '@aws-sdk/client-apigatewayv2';

import { waitCreation, waitDeletion } from '@ez4/aws-common';
import { getApiGatewayV2Client } from '../utils/deploy';

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

export const importRoute = async (
  logger: OperationLogLine,
  apiId: string,
  routePath: string
): Promise<ImportOrCreateResponse | undefined> => {
  logger.update(`Importing route`);

  const client = getApiGatewayV2Client();

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
  const routeArn = await getRouteArn(client, apiId, routeId);

  return {
    routeArn,
    routeId
  };
};

export const createRoute = async (logger: OperationLogLine, apiId: string, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  logger.update(`Creating route`);

  const { integrationId, authorizerId, operationName, routePath } = request;

  const client = getApiGatewayV2Client();

  // If multiple routes are created at the same time, a conflict error occurs.
  // The `waitCreation` will keep retrying until max attempts.
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
  const routeArn = await getRouteArn(client, apiId, routeId);

  return {
    routeArn,
    routeId
  };
};

export const updateRoute = async (logger: OperationLogLine, apiId: string, routeId: string, request: UpdateRequest) => {
  logger.update(`Update route`);

  const { integrationId, authorizerId, operationName, routePath } = request;

  const authorizationType = authorizerId ? AuthorizationType.CUSTOM : AuthorizationType.NONE;

  await getApiGatewayV2Client().send(
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

export const deleteRoute = async (logger: OperationLogLine, apiId: string, routeId: string) => {
  logger.update(`Deleting route`);

  const client = getApiGatewayV2Client();

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

const getRouteArn = async (client: ApiGatewayV2Client, apiId: string, routeId: string) => {
  const region = await client.config.region();

  return `arn:aws:apigateway:${region}::/apis/${apiId}/routes/${routeId}` as Arn;
};
