import type { Arn } from '@ez4/aws-common';

import { SQSClient, SetQueueAttributesCommand } from '@aws-sdk/client-sqs';

import { createRoleDocument } from '@ez4/aws-identity';
import { Logger, tryParseArn } from '@ez4/aws-common';

import { queueUrlToArn } from '../utils/policy.js';
import { PolicyServiceName } from './types.js';

const client = new SQSClient({});

export type CreateRequest = {
  principal: string;
  sourceArn: Arn;
};

export type CreateResponse = {
  sourceArn: string;
};

export const attachPolicy = async (queueUrl: string, request: CreateRequest): Promise<CreateResponse> => {
  const { principal, sourceArn } = request;

  const sourceName = tryParseArn(sourceArn)?.resourceName ?? sourceArn;

  Logger.logAttach(PolicyServiceName, queueUrl, sourceName);

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
  const sourceName = tryParseArn(sourceArn)?.resourceName ?? sourceArn;

  Logger.logDetach(PolicyServiceName, queueUrl, sourceName);

  await client.send(
    new SetQueueAttributesCommand({
      QueueUrl: queueUrl,
      Attributes: {
        Policy: ''
      }
    })
  );
};
