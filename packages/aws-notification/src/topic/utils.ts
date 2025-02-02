import type { EntryState, StepContext } from '@ez4/stateful';
import type { TopicState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';
import { hashData, toKebabCase } from '@ez4/utils';

import { TopicServiceType } from './types.js';

export const isTopicState = (resource: EntryState): resource is TopicState => {
  return resource.type === TopicServiceType;
};

export const getTopicStateId = (topicName: string) => {
  return hashData(TopicServiceType, toKebabCase(topicName));
};

export const getTopicArn = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<TopicState>(TopicServiceType).at(0)?.result;

  if (!resource?.topicArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'topicArn');
  }

  return resource.topicArn;
};
