import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { TopicState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';
import { hashData, toKebabCase } from '@ez4/utils';

import { TopicNotFoundError } from './errors.js';
import { TopicServiceType } from './types.js';

export const createTopicStateId = (topicName: string, normalize = true) => {
  return hashData(TopicServiceType, normalize ? toKebabCase(topicName) : topicName);
};

export const isTopicState = (resource: EntryState): resource is TopicState => {
  return resource.type === TopicServiceType;
};

export const getTopicState = (context: EventContext, topicName: string, options: DeployOptions) => {
  const topicState = context.getServiceState(topicName, options);

  if (!isTopicState(topicState)) {
    throw new TopicNotFoundError(topicName);
  }

  return topicState;
};

export const getTopicArn = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<TopicState>(TopicServiceType).at(0)?.result;

  if (!resource?.topicArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'topicArn');
  }

  return resource.topicArn;
};
