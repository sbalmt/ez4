import type { Variables } from '../types/variables.js';

import {
  ApiGatewayV2Client,
  CreateStageCommand,
  DeleteStageCommand,
  UpdateStageCommand
} from '@aws-sdk/client-apigatewayv2';

import { Logger } from '@ez4/aws-common';

import { StageServiceName } from './types.js';
import { assertVariables } from './helpers/variables.js';

const client = new ApiGatewayV2Client({});

export type CreateRequest = {
  stageName: string;
  stageVariables?: Variables;
  autoDeploy?: boolean;
};

export type CreateResponse = {
  stageName: string;
};

export const createStage = async (
  apiId: string,
  request: CreateRequest
): Promise<CreateResponse> => {
  Logger.logCreate(StageServiceName, request.stageName);

  if (request.stageVariables) {
    assertVariables(StageServiceName, request.stageVariables);
  }

  const response = await client.send(
    new CreateStageCommand({
      ApiId: apiId,
      StageName: request.stageName,
      StageVariables: request.stageVariables,
      AutoDeploy: request.autoDeploy
    })
  );

  return {
    stageName: response.StageName!
  };
};

export const updateStage = async (
  apiId: string,
  stageName: string,
  request: Partial<CreateRequest>
) => {
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

export const deleteStage = async (apiId: string, stageName: string) => {
  Logger.logDelete(StageServiceName, stageName);

  await client.send(
    new DeleteStageCommand({
      ApiId: apiId,
      StageName: stageName
    })
  );
};
