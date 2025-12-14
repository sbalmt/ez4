import { Logger } from '@ez4/aws-common';

import {
  ApiGatewayV2Client,
  CreateRouteResponseCommand,
  UpdateRouteResponseCommand,
  DeleteRouteResponseCommand,
  NotFoundException
} from '@aws-sdk/client-apigatewayv2';

import { ResponseServiceName } from './types';

const client = new ApiGatewayV2Client({});

export type CreateRequest = {
  responseKey: string;
};

export type CreateResponse = {
  responseId: string;
};

export type UpdateRequest = Partial<CreateRequest>;

export const createResponse = async (apiId: string, routeId: string, request: CreateRequest): Promise<CreateResponse> => {
  const { responseKey } = request;

  Logger.logCreate(ResponseServiceName, responseKey);

  const response = await client.send(
    new CreateRouteResponseCommand({
      RouteResponseKey: responseKey,
      RouteId: routeId,
      ApiId: apiId
    })
  );

  const responseId = response.RouteResponseId!;

  return {
    responseId
  };
};

export const updateResponse = async (apiId: string, routeId: string, responseId: string, request: UpdateRequest) => {
  const { responseKey } = request;

  Logger.logUpdate(ResponseServiceName, responseId);

  await client.send(
    new UpdateRouteResponseCommand({
      RouteResponseKey: responseKey,
      RouteResponseId: responseId,
      RouteId: routeId,
      ApiId: apiId
    })
  );
};

export const deleteResponse = async (apiId: string, routeId: string, responseId: string) => {
  Logger.logDelete(ResponseServiceName, responseId);

  try {
    await client.send(
      new DeleteRouteResponseCommand({
        RouteResponseId: responseId,
        RouteId: routeId,
        ApiId: apiId
      })
    );

    return true;
  } catch (error) {
    if (!(error instanceof NotFoundException)) {
      throw error;
    }

    return false;
  }
};
