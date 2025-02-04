import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const TopicServiceName = 'AWS:SNS/Topic';

export const TopicServiceType = 'aws:sns.topic';

export type TopicParameters = CreateRequest & {
  import?: boolean;
};

export type TopicResult = CreateResponse;

export type TopicState = EntryState & {
  type: typeof TopicServiceType;
  parameters: TopicParameters;
  result?: TopicResult;
};
