import type { Arn } from '@ez4/aws-common';

import { CloudWatchLogsClient, PutResourcePolicyCommand, DeleteResourcePolicyCommand } from '@aws-sdk/client-cloudwatch-logs';
import { createRoleDocument, createRoleStatement } from '@ez4/aws-identity';
import { Logger, tryParseArn } from '@ez4/aws-common';

import { LogPolicyServiceName } from './types';

const client = new CloudWatchLogsClient({});

export type AttachRequest = {
  service: string;
};

export type AttachResponse = {
  revisionId: string;
};

export const attachPolicy = async (groupArn: Arn, request: AttachRequest) => {
  const groupName = tryParseArn(groupArn)?.resourceName ?? groupArn;

  Logger.logAttach(LogPolicyServiceName, groupName, `policy`);

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

  const response = await client.send(
    new PutResourcePolicyCommand({
      policyDocument: JSON.stringify(createRoleDocument([statement])),
      resourceArn: groupArn
    })
  );

  return {
    revisionId: response.revisionId!
  };
};

export const detachPolicy = async (groupArn: Arn, revisionId: string) => {
  const groupName = tryParseArn(groupArn)?.resourceName ?? groupArn;

  Logger.logDetach(LogPolicyServiceName, groupName, `policy`);

  await client.send(
    new DeleteResourcePolicyCommand({
      expectedRevisionId: revisionId,
      resourceArn: groupArn
    })
  );
};
