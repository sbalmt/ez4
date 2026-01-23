import type { Arn, OperationLogLine } from '@ez4/aws-common';

import { SetQueueAttributesCommand } from '@aws-sdk/client-sqs';
import { createRoleDocument, createRoleStatement } from '@ez4/aws-identity';

import { parseQueueUrl } from '../queue/helpers/url';
import { getSQSClient } from '../utils/deploy';
import { buildQueueArn } from '../utils/arn';

export type AttachRequest = {
  principal: string;
  sourceArn: Arn;
};

export type AttachResponse = {
  sourceArns: Arn[];
};

export const attachPolicies = async (logger: OperationLogLine, queueUrl: string, policies: AttachRequest[]): Promise<AttachResponse> => {
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

  await getSQSClient().send(
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

export const detachPolicy = async (logger: OperationLogLine, queueUrl: string) => {
  logger.update(`Detaching queue policies`);

  await getSQSClient().send(
    new SetQueueAttributesCommand({
      QueueUrl: queueUrl,
      Attributes: {
        Policy: ''
      }
    })
  );
};
