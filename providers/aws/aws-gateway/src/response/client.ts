import type { Logger } from '@ez4/aws-common';

import {
  ApiGatewayV2Client,
  CreateRouteResponseCommand,
  UpdateRouteResponseCommand,
  DeleteRouteResponseCommand,
  NotFoundException
} from '@aws-sdk/client-apigatewayv2';

const client = new ApiGatewayV2Client({});

export type CreateRequest = {
  responseKey: string;
};

export type CreateResponse = {
  responseId: string;
};

export type UpdateRequest = Partial<CreateRequest>;

export const createResponse = async (
  logger: Logger.OperationLogger,
  apiId: string,
  routeId: string,
  request: CreateRequest
): Promise<CreateResponse> => {
  logger.update(`Creating response`);

  const { responseKey } = request;

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

export const updateResponse = async (
  logger: Logger.OperationLogger,
  apiId: string,
  routeId: string,
  responseId: string,
  request: UpdateRequest
) => {
  logger.update(`Updating response`);

  const { responseKey } = request;

  await client.send(
    new UpdateRouteResponseCommand({
      RouteResponseKey: responseKey,
      RouteResponseId: responseId,
      RouteId: routeId,
      ApiId: apiId
    })
  );
};

export const deleteResponse = async (logger: Logger.OperationLogger, apiId: string, routeId: string, responseId: string) => {
  logger.update(`Deleting response`);

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
