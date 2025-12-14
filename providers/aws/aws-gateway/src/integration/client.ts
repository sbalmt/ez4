import type { Arn } from '@ez4/aws-common';

import {
  ApiGatewayV2Client,
  CreateIntegrationCommand,
  UpdateIntegrationCommand,
  DeleteIntegrationCommand,
  NotFoundException
} from '@aws-sdk/client-apigatewayv2';

import { Logger, tryParseArn, waitUpdates } from '@ez4/aws-common';

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

export type UpdateRequest = Omit<CreateRequest, 'functionArn'> & Partial<Pick<CreateRequest, 'functionArn'>>;

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
      PayloadFormatVersion: http ? '2.0' : undefined,
      ConnectionType: vpcId ? 'VPC_LINK' : 'INTERNET',
      TimeoutInMillis: (timeout ?? 30) * 1000,
      ConnectionId: vpcId
    })
  );

  return {
    integrationId: response.IntegrationId!
  };
};

export const updateIntegration = async (apiId: string, integrationId: string, request: UpdateRequest) => {
  const { http, functionArn, vpcId, timeout, description } = request;

  Logger.logUpdate(IntegrationServiceName, integrationId);

  await waitUpdates(() => {
    return client.send(
      new UpdateIntegrationCommand({
        ApiId: apiId,
        IntegrationId: integrationId,
        Description: description,
        IntegrationUri: functionArn,
        PayloadFormatVersion: http ? '2.0' : undefined,
        ConnectionType: vpcId !== undefined ? (vpcId ? 'VPC_LINK' : 'INTERNET') : undefined,
        TimeoutInMillis: timeout !== undefined ? (timeout ?? 30) * 1000 : undefined,
        ConnectionId: vpcId
      })
    );
  });
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
