import type { Arn } from '@ez4/aws-common';

import { SQSClient, SetQueueAttributesCommand } from '@aws-sdk/client-sqs';

import { createRoleDocument } from '@ez4/aws-identity';
import { Logger, tryParseArn } from '@ez4/aws-common';

import { parseQueueUrl } from '../queue/helpers/url.js';
import { buildQueueArn } from '../utils/policy.js';
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

  const { queueName, accountId, region } = parseQueueUrl(queueUrl);

  const sourceName = tryParseArn(sourceArn)?.resourceName ?? sourceArn;

  Logger.logAttach(PolicyServiceName, queueName, sourceName);

  const policy = createRoleDocument(
    {
      permissions: ['sqs:SendMessage'],
      resourceIds: [buildQueueArn(region, accountId, queueName)]
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
  const { queueName } = parseQueueUrl(queueUrl);

  const sourceName = tryParseArn(sourceArn)?.resourceName ?? sourceArn;

  Logger.logDetach(PolicyServiceName, queueName, sourceName);

  await client.send(
    new SetQueueAttributesCommand({
      QueueUrl: queueUrl,
      Attributes: {
        Policy: ''
      }
    })
  );
};
