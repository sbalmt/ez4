import type { Arn, Logger } from '@ez4/aws-common';

import { PutResourcePolicyCommand, DeleteResourcePolicyCommand } from '@aws-sdk/client-cloudwatch-logs';
import { createRoleDocument, createRoleStatement } from '@ez4/aws-identity';

import { getCloudWatchLogsClient } from '../utils/deploy';

export type AttachRequest = {
  service: string;
};

export type AttachResponse = {
  revisionId: string;
};

export const attachPolicy = async (logger: Logger.OperationLogger, groupArn: Arn, request: AttachRequest) => {
  logger.update(`Attaching log group policy`);

  const statement = createRoleStatement(
    {
      permissions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
      resourceIds: [`${groupArn}:*`]
    },
    [
      {
        account: request.service
      }
    ]
  );

  const response = await getCloudWatchLogsClient().send(
    new PutResourcePolicyCommand({
      policyDocument: JSON.stringify(createRoleDocument([statement])),
      resourceArn: groupArn
    })
  );

  return {
    revisionId: response.revisionId!
  };
};

export const detachPolicy = async (logger: Logger.OperationLogger, groupArn: Arn, revisionId: string) => {
  logger.update(`Detaching log group policy`);

  await getCloudWatchLogsClient().send(
    new DeleteResourcePolicyCommand({
      expectedRevisionId: revisionId,
      resourceArn: groupArn
    })
  );
};
