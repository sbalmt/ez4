import type { Logger } from '@ez4/aws-common';
import type { Arn } from '@ez4/aws-common';

import { AddPermissionCommand, RemovePermissionCommand, ResourceNotFoundException } from '@aws-sdk/client-lambda';
import { getLambdaClient } from '../utils/deploy';

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

export const createPermission = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating permission`);

  const statementId = request.statementId ?? `ID${Date.now()}`;

  await getLambdaClient().send(
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

export const deletePermission = async (logger: Logger.OperationLogger, functionName: string, statementId: string) => {
  logger.update(`Deleting permission`);

  try {
    await getLambdaClient().send(
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
