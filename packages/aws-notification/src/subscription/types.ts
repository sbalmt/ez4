import type { Arn } from '@ez4/aws-common';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { CreateResponse } from './client.js';

export const SubscriptionServiceName = 'AWS:SNS/Subscription';

export const SubscriptionServiceType = 'aws:sns.subscription';

export type GetSubscriptionTopicArn = (context: StepContext) => Promise<Arn> | Arn;
export type GetSubscriptionEndpoint = (context: StepContext) => Promise<string> | string;

export type SubscriptionParameters = {
  getTopicArn: GetSubscriptionTopicArn;
  getEndpoint: GetSubscriptionEndpoint;
  fromService: string;
};

export type SubscriptionResult = CreateResponse & {
  topicArn: Arn;
  endpoint: string;
};

export type SubscriptionState = EntryState & {
  type: typeof SubscriptionServiceType;
  parameters: SubscriptionParameters;
  result?: SubscriptionResult;
};
