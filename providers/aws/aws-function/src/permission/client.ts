import type { Arn } from '@ez4/aws-common';

import { LambdaClient, AddPermissionCommand, RemovePermissionCommand, ResourceNotFoundException } from '@aws-sdk/client-lambda';
import { Logger } from '@ez4/aws-common';

import { PermissionServiceName } from './types';

const client = new LambdaClient({});

export type CreateRequest = {
  functionName: string;
  statementId?: string;
  sourceArn?: Arn;
  principal: string;
  action: string;
};

export type CreateResponse = {
  statementId: string;
};

export const createPermission = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(PermissionServiceName, request.functionName);

  const statementId = request.statementId ?? `SID${Date.now()}`;

  await client.send(
    new AddPermissionCommand({
      StatementId: statementId,
      FunctionName: request.functionName,
      SourceArn: request.sourceArn,
      Principal: request.principal,
      Action: request.action
    })
  );

  return {
    statementId
  };
};

export const deletePermission = async (functionName: string, statementId: string) => {
  Logger.logDelete(PermissionServiceName, functionName);

  try {
    await client.send(
      new RemovePermissionCommand({
        FunctionName: functionName,
        StatementId: statementId
      })
    );

    return true;
  } catch (error) {
    if (!(error instanceof ResourceNotFoundException)) {
      throw error;
    }

    return false;
  }
};
