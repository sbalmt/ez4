import type { Arn, Logger } from '@ez4/aws-common';

import { NotFoundException, SubscribeCommand, UnsubscribeCommand } from '@aws-sdk/client-sns';

import { getSNSClient } from '../utils/deploy';

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

export const createSubscription = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating topic subscription`);

  const { topicArn, protocol, endpoint } = request;

  const response = await getSNSClient().send(
    new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: protocol,
      Endpoint: endpoint,
      ReturnSubscriptionArn: true,
      Attributes: {
        ...(protocol === SubscriptionProtocol.SQS && {
          RawMessageDelivery: 'true'
        })
      }
    })
  );

  return {
    subscriptionArn: response.SubscriptionArn as Arn
  };
};

export const deleteSubscription = async (logger: Logger.OperationLogger, subscriptionArn: string) => {
  logger.update(`Deleting topic subscription`);

  try {
    await getSNSClient().send(
      new UnsubscribeCommand({
        SubscriptionArn: subscriptionArn
      })
    );

    return true;
  } catch (error) {
    if (!(error instanceof NotFoundException)) {
      throw error;
    }

    return false;
  }
};
