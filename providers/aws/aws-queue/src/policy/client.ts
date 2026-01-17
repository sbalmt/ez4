import type { Arn, Logger } from '@ez4/aws-common';

import { SQSClient, SetQueueAttributesCommand } from '@aws-sdk/client-sqs';
import { createRoleDocument, createRoleStatement } from '@ez4/aws-identity';

import { parseQueueUrl } from '../queue/helpers/url';
import { buildQueueArn } from '../utils/arn';

const client = new SQSClient({});

export type AttachRequest = {
  principal: string;
  sourceArn: Arn;
};

export type AttachResponse = {
  sourceArns: Arn[];
};

export const attachPolicies = async (
  logger: Logger.OperationLogger,
  queueUrl: string,
  policies: AttachRequest[]
): Promise<AttachResponse> => {
  logger.update(`Attaching queue policies`);

  const { queueName, accountId, region } = parseQueueUrl(queueUrl);
  const sourceArns = new Set<Arn>();

  const statements = policies.map(({ principal, sourceArn }) => {
    sourceArns.add(sourceArn);

    return createRoleStatement(
      {
        permissions: ['sqs:SendMessage'],
        resourceIds: [buildQueueArn(region, accountId, queueName)]
      },
      [{ account: principal }],
      sourceArn
    );
  });

  await client.send(
    new SetQueueAttributesCommand({
      QueueUrl: queueUrl,
      Attributes: {
        Policy: JSON.stringify(createRoleDocument(statements))
      }
    })
  );

  return {
    sourceArns: [...sourceArns.values()]
  };
};

export const detachPolicy = async (logger: Logger.OperationLogger, queueUrl: string) => {
  logger.update(`Detaching queue policies`);

  await client.send(
    new SetQueueAttributesCommand({
      QueueUrl: queueUrl,
      Attributes: {
        Policy: ''
      }
    })
  );
};
