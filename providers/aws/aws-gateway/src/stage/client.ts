import type { Arn } from '@ez4/aws-common';
import type { Variables } from '../types/variables';

import {
  ApiGatewayV2Client,
  GetStageCommand,
  CreateStageCommand,
  UpdateStageCommand,
  DeleteStageCommand,
  DeleteAccessLogSettingsCommand,
  NotFoundException
} from '@aws-sdk/client-apigatewayv2';

import { Logger } from '@ez4/aws-common';

import { assertVariables } from './helpers/variables';
import { StageServiceName } from './types';

const client = new ApiGatewayV2Client({});

export type CreateRequest = {
  stageName: string;
  stageVariables?: Variables;
  autoDeploy?: boolean;
};

export type ImportOrCreateResponse = {
  stageName: string;
};

export const importStage = async (apiId: string, stageName: string): Promise<ImportOrCreateResponse | undefined> => {
  Logger.logImport(StageServiceName, stageName);

  try {
    const response = await client.send(
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

export const createStage = async (apiId: string, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  Logger.logCreate(StageServiceName, request.stageName);

  if (request.stageVariables) {
    assertVariables(StageServiceName, request.stageVariables);
  }

  const { stageName, stageVariables, autoDeploy } = request;

  const response = await client.send(
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

export const updateStage = async (apiId: string, stageName: string, request: Partial<CreateRequest>) => {
  Logger.logUpdate(StageServiceName, stageName);

  const { stageVariables, autoDeploy } = request;

  if (stageVariables) {
    assertVariables(StageServiceName, stageVariables);
  }

  await client.send(
    new UpdateStageCommand({
      ApiId: apiId,
      StageName: stageName,
      StageVariables: stageVariables,
      AutoDeploy: autoDeploy
    })
  );
};

export const enableAccessLogs = async (apiId: string, stageName: string, logGroupArn: Arn) => {
  Logger.logAttach(StageServiceName, stageName, 'access logs');

  await client.send(
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

export const disableAccessLogs = async (apiId: string, stageName: string) => {
  Logger.logDetach(StageServiceName, stageName, 'access logs');

  await client.send(
    new DeleteAccessLogSettingsCommand({
      ApiId: apiId,
      StageName: stageName
    })
  );
};

export const deleteStage = async (apiId: string, stageName: string) => {
  Logger.logDelete(StageServiceName, stageName);

  try {
    await client.send(
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
