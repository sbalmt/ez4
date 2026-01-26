import type { Arn, OperationLogLine } from '@ez4/aws-common';
import type { Variables } from '../types/variables';

import {
  GetStageCommand,
  CreateStageCommand,
  UpdateStageCommand,
  DeleteStageCommand,
  DeleteAccessLogSettingsCommand,
  NotFoundException
} from '@aws-sdk/client-apigatewayv2';

import { getApiGatewayV2Client } from '../utils/deploy';
import { assertVariables } from './helpers/variables';
import { StageServiceName } from './types';

export type CreateRequest = {
  stageName: string;
  stageVariables?: Variables;
  autoDeploy?: boolean;
};

export type ImportOrCreateResponse = {
  stageName: string;
};

export const importStage = async (
  logger: OperationLogLine,
  apiId: string,
  stageName: string
): Promise<ImportOrCreateResponse | undefined> => {
  logger.update(`Importing API stage`);

  try {
    const response = await getApiGatewayV2Client().send(
      new GetStageCommand({
        ApiId: apiId,
        StageName: stageName
      })
    );

    return {
      stageName: response.StageName!
    };
  } catch (error) {
    if (!(error instanceof NotFoundException)) {
      throw error;
    }

    return undefined;
  }
};

export const createStage = async (logger: OperationLogLine, apiId: string, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  logger.update(`Creating API stage`);

  const { stageName, stageVariables, autoDeploy } = request;

  if (stageVariables) {
    assertVariables(StageServiceName, stageVariables);
  }

  const response = await getApiGatewayV2Client().send(
    new CreateStageCommand({
      ApiId: apiId,
      StageName: stageName,
      StageVariables: stageVariables,
      AutoDeploy: autoDeploy
    })
  );

  return {
    stageName: response.StageName!
  };
};

export const updateStage = async (logger: OperationLogLine, apiId: string, stageName: string, request: Partial<CreateRequest>) => {
  logger.update(`Updating API stage`);

  const { stageVariables, autoDeploy } = request;

  if (stageVariables) {
    assertVariables(StageServiceName, stageVariables);
  }

  await getApiGatewayV2Client().send(
    new UpdateStageCommand({
      ApiId: apiId,
      StageName: stageName,
      StageVariables: stageVariables,
      AutoDeploy: autoDeploy
    })
  );
};

export const enableAccessLogs = async (logger: OperationLogLine, apiId: string, stageName: string, logGroupArn: Arn) => {
  logger.update(`Enabling API access logs`);

  await getApiGatewayV2Client().send(
    new UpdateStageCommand({
      ApiId: apiId,
      StageName: stageName,
      AccessLogSettings: {
        DestinationArn: logGroupArn,
        Format: JSON.stringify({
          requestId: '$context.requestId',
          timestamp: '$context.requestTimeEpoch',
          protocol: '$context.protocol',
          route: '$context.routeKey',
          status: '$context.status',
          errorMessage: '$context.error.message',
          responseLength: '$context.responseLength',
          authorizationError: '$context.authorizer.error',
          integrationRequestId: '$context.integration.requestId',
          integrationStatus: '$context.integration.status',
          integrationError: '$context.integration.error',
          integrationLatency: '$context.integration.latency',
          userAgent: '$context.identity.userAgent',
          ip: '$context.identity.sourceIp'
        })
      }
    })
  );
};

export const disableAccessLogs = async (logger: OperationLogLine, apiId: string, stageName: string) => {
  logger.update(`Disabling API access logs`);

  await getApiGatewayV2Client().send(
    new DeleteAccessLogSettingsCommand({
      ApiId: apiId,
      StageName: stageName
    })
  );
};

export const deleteStage = async (logger: OperationLogLine, apiId: string, stageName: string) => {
  logger.update(`Deleting API stage`);

  try {
    await getApiGatewayV2Client().send(
      new DeleteStageCommand({
        ApiId: apiId,
        StageName: stageName
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
