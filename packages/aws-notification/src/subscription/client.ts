import type { Arn } from '@ez4/aws-common';

import { SNSClient, SubscribeCommand, UnsubscribeCommand } from '@aws-sdk/client-sns';
import { Logger } from '@ez4/aws-common';

import { SubscriptionServiceName } from './types.js';

const client = new SNSClient({});

export const enum SubscriptionProtocol {
  Lambda = 'lambda',
  SQS = 'sqs'
}

export type CreateRequest = {
  topicArn: string;
  protocol: SubscriptionProtocol;
  endpoint: string;
};

export type CreateResponse = {
  subscriptionArn: Arn;
};

export const createSubscription = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logUpdate(SubscriptionServiceName, request.topicArn);

  const { topicArn, protocol, endpoint } = request;

  const response = await client.send(
    new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: protocol,
      Endpoint: endpoint
    })
  );

  return {
    subscriptionArn: response.SubscriptionArn as Arn
  };
};

export const deleteSubscription = async (subscriptionArn: string) => {
  Logger.logDelete(SubscriptionServiceName, subscriptionArn);

  await client.send(
    new UnsubscribeCommand({
      SubscriptionArn: subscriptionArn
    })
  );
};
