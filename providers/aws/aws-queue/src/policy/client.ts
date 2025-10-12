import type { Arn } from '@ez4/aws-common';

import { SQSClient, SetQueueAttributesCommand } from '@aws-sdk/client-sqs';

import { createRoleDocument, createRoleStatement } from '@ez4/aws-identity';
import { Logger, tryParseArn } from '@ez4/aws-common';

import { parseQueueUrl } from '../queue/helpers/url';
import { buildQueueArn } from '../utils/arn';
import { QueuePolicyServiceName } from './types';

const client = new SQSClient({});

export type AttachRequest = {
  principal: string;
  sourceArn: Arn;
};

export type AttachResponse = {
  sourceArns: Arn[];
};

export const attachPolicies = async (queueUrl: string, policies: AttachRequest[]): Promise<AttachResponse> => {
  const { queueName, accountId, region } = parseQueueUrl(queueUrl);
  const sourceArns = new Set<Arn>();

  const statements = policies.map(({ principal, sourceArn }) => {
    const sourceName = tryParseArn(sourceArn)?.resourceName ?? sourceArn;

    Logger.logAttach(QueuePolicyServiceName, queueName, sourceName);

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

export const detachPolicy = async (queueUrl: string, sourceArns: Arn[]) => {
  const { queueName } = parseQueueUrl(queueUrl);

  sourceArns.forEach((sourceArn) => {
    const sourceName = tryParseArn(sourceArn)?.resourceName ?? sourceArn;

    Logger.logDetach(QueuePolicyServiceName, queueName, sourceName);
  });

  await client.send(
    new SetQueueAttributesCommand({
      QueueUrl: queueUrl,
      Attributes: {
        Policy: ''
      }
    })
  );
};
