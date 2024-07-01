import {
  ApiGatewayV2Client,
  CreateIntegrationCommand,
  DeleteIntegrationCommand,
  UpdateIntegrationCommand
} from '@aws-sdk/client-apigatewayv2';

import { Arn, Logger } from '@ez4/aws-common';

import { IntegrationServiceName } from './types.js';

const client = new ApiGatewayV2Client({});

export type CreateRequest = {
  functionArn: Arn;
  description?: string;
  vpcId?: string;
};

export type CreateResponse = {
  integrationId: string;
};

export type UpdateRequest = Partial<CreateRequest>;

export const createIntegration = async (
  apiId: string,
  request: CreateRequest
): Promise<CreateResponse> => {
  Logger.logCreate(IntegrationServiceName, request.functionArn);

  const response = await client.send(
    new CreateIntegrationCommand({
      ApiId: apiId,
      Description: request.description,
      IntegrationType: 'AWS_PROXY',
      IntegrationMethod: 'POST',
      IntegrationUri: request.functionArn,
      ConnectionType: request.vpcId ? 'VPC_LINK' : 'INTERNET',
      ConnectionId: request.vpcId,
      PayloadFormatVersion: '2.0'
    })
  );

  return {
    integrationId: response.IntegrationId!
  };
};

export const updateIntegration = async (
  apiId: string,
  integrationId: string,
  request: UpdateRequest
) => {
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

  await client.send(
    new DeleteIntegrationCommand({
      ApiId: apiId,
      IntegrationId: integrationId
    })
  );
};
