import type { OperationLogLine } from '@ez4/aws-common';

import {
  CreateRouteResponseCommand,
  UpdateRouteResponseCommand,
  DeleteRouteResponseCommand,
  NotFoundException
} from '@aws-sdk/client-apigatewayv2';

import { getApiGatewayV2Client } from '../utils/deploy';

export type CreateRequest = {
  responseKey: string;
};

export type CreateResponse = {
  responseId: string;
};

export type UpdateRequest = Partial<CreateRequest>;

export const createResponse = async (
  logger: OperationLogLine,
  apiId: string,
  routeId: string,
  request: CreateRequest
): Promise<CreateResponse> => {
  logger.update(`Creating response`);

  const { responseKey } = request;

  const response = await getApiGatewayV2Client().send(
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
  logger: OperationLogLine,
  apiId: string,
  routeId: string,
  responseId: string,
  request: UpdateRequest
) => {
  logger.update(`Updating response`);

  const { responseKey } = request;

  await getApiGatewayV2Client().send(
    new UpdateRouteResponseCommand({
      RouteResponseKey: responseKey,
      RouteResponseId: responseId,
      RouteId: routeId,
      ApiId: apiId
    })
  );
};

export const deleteResponse = async (logger: OperationLogLine, apiId: string, routeId: string, responseId: string) => {
  logger.update(`Deleting response`);

  try {
    await getApiGatewayV2Client().send(
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
