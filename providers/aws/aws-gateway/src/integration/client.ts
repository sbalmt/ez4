import type { Arn, Logger } from '@ez4/aws-common';

import {
  CreateIntegrationCommand,
  UpdateIntegrationCommand,
  DeleteIntegrationCommand,
  NotFoundException
} from '@aws-sdk/client-apigatewayv2';

import { getApiGatewayV2Client } from '../utils/deploy';

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

export const createIntegration = async (logger: Logger.OperationLogger, apiId: string, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating integration`);

  const { http, functionArn, vpcId, timeout, description } = request;

  const response = await getApiGatewayV2Client().send(
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

export const updateIntegration = async (logger: Logger.OperationLogger, apiId: string, integrationId: string, request: UpdateRequest) => {
  logger.update(`Updating integration`);

  const { http, functionArn, vpcId, timeout, description } = request;

  return getApiGatewayV2Client().send(
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
};

export const deleteIntegration = async (logger: Logger.OperationLogger, apiId: string, integrationId: string) => {
  logger.update(`Deleting integration`);

  try {
    await getApiGatewayV2Client().send(
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
