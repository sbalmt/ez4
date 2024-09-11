import type { Arn } from '@ez4/aws-common';

import {
  EventBridgeClient,
  PutTargetsCommand,
  RemoveTargetsCommand
} from '@aws-sdk/client-eventbridge';

import { Logger } from '@ez4/aws-common';

import { TargetServiceName } from './types.js';

const client = new EventBridgeClient({});

export type CreateRequest = {
  functionArn: Arn;
  roleArn?: Arn;
};

export type CreateResponse = {
  targetId: string;
};

export type UpdateRequest = Partial<CreateRequest>;

export const createTarget = async (
  ruleName: string,
  request: CreateRequest
): Promise<CreateResponse> => {
  Logger.logCreate(TargetServiceName, ruleName);

  const { functionArn, roleArn } = request;

  const targetId = Date.now().toString();

  await client.send(
    new PutTargetsCommand({
      Rule: ruleName,
      Targets: [
        {
          Id: targetId,
          Arn: functionArn,
          RoleArn: roleArn
        }
      ]
    })
  );

  return {
    targetId
  };
};

export const updateTarget = async (ruleName: string, targetId: string, request: UpdateRequest) => {
  Logger.logUpdate(TargetServiceName, ruleName);

  const { functionArn, roleArn } = request;

  await client.send(
    new PutTargetsCommand({
      Rule: ruleName,
      Targets: [
        {
          Id: targetId,
          Arn: functionArn,
          RoleArn: roleArn
        }
      ]
    })
  );
};

export const deleteTarget = async (ruleName: string, targetId: string) => {
  Logger.logDelete(TargetServiceName, ruleName);

  await client.send(
    new RemoveTargetsCommand({
      Rule: ruleName,
      Ids: [targetId]
    })
  );
};
