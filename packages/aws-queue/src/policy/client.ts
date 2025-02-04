import type { Arn } from '@ez4/aws-common';

import { SQSClient, SetQueueAttributesCommand } from '@aws-sdk/client-sqs';

import { createRoleDocument } from '@ez4/aws-identity';
import { Logger } from '@ez4/aws-common';

import { PolicyServiceName } from './types.js';
import { queueUrlToArn } from '../utils/policy.js';

const client = new SQSClient({});

export type CreateRequest = {
  principal: string;
  sourceArn: Arn;
};

export type CreateResponse = {
  sourceArn: string;
};

export const attachPolicy = async (
  queueUrl: string,
  request: CreateRequest
): Promise<CreateResponse> => {
  const { principal, sourceArn } = request;

  Logger.logAttach(PolicyServiceName, queueUrl, sourceArn);

  const policy = createRoleDocument(
    {
      permissions: ['sqs:SendMessage'],
      resourceIds: [queueUrlToArn(queueUrl)]
    },
    [{ account: principal }],
    sourceArn
  );

  await client.send(
    new SetQueueAttributesCommand({
      QueueUrl: queueUrl,
      Attributes: {
        Policy: JSON.stringify(policy)
      }
    })
  );

  return {
    sourceArn
  };
};

export const detachPolicy = async (queueUrl: string, sourceArn: string) => {
  Logger.logDetach(PolicyServiceName, queueUrl, sourceArn);

  await client.send(
    new SetQueueAttributesCommand({
      QueueUrl: queueUrl,
      Attributes: {
        Policy: ''
      }
    })
  );
};
