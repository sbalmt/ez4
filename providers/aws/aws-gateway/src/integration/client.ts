import type { Arn } from '@ez4/aws-common';

import {
  ApiGatewayV2Client,
  CreateIntegrationCommand,
  UpdateIntegrationCommand,
  DeleteIntegrationCommand,
  NotFoundException
} from '@aws-sdk/client-apigatewayv2';

import { Logger, tryParseArn } from '@ez4/aws-common';

import { IntegrationServiceName } from './types';

const client = new ApiGatewayV2Client({});

export type CreateRequest = {
  http: boolean;
  functionArn: Arn;
  description?: string;
  timeout?: number;
  vpcId?: string;
};

export type CreateResponse = {
  integrationId: string;
};

export type UpdateRequest = Partial<CreateRequest>;

export const createIntegration = async (apiId: string, request: CreateRequest): Promise<CreateResponse> => {
  const { http, functionArn, vpcId, timeout, description } = request;

  const functionName = tryParseArn(functionArn)?.resourceName ?? functionArn;

  Logger.logCreate(IntegrationServiceName, functionName);

  const response = await client.send(
    new CreateIntegrationCommand({
      ApiId: apiId,
      Description: description,
      IntegrationUri: functionArn,
      IntegrationType: 'AWS_PROXY',
      IntegrationMethod: 'POST',
      ConnectionType: vpcId ? 'VPC_LINK' : 'INTERNET',
      PayloadFormatVersion: http ? '2.0' : undefined,
      TimeoutInMillis: (timeout ?? 30) * 1000,
      ConnectionId: vpcId
    })
  );

  return {
    integrationId: response.IntegrationId!
  };
};

export const updateIntegration = async (apiId: string, integrationId: string, request: UpdateRequest) => {
  Logger.logUpdate(IntegrationServiceName, integrationId);

  await client.send(
    new UpdateIntegrationCommand({
      ApiId: apiId,
      IntegrationId: integrationId,
      Description: request.description,
      IntegrationUri: request.functionArn,
      ConnectionType: request.vpcId ? 'VPC_LINK' : 'INTERNET',
      ConnectionId: request.vpcId
    })
  );
};

export const deleteIntegration = async (apiId: string, integrationId: string) => {
  Logger.logDelete(IntegrationServiceName, integrationId);

  try {
    await client.send(
      new DeleteIntegrationCommand({
        ApiId: apiId,
        IntegrationId: integrationId
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
