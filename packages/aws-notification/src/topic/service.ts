import type { EntryState, EntryStates } from '@ez4/stateful';
import type { TopicParameters, TopicState } from './types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { createTopicStateId, isTopicState } from './utils.js';
import { TopicServiceType } from './types.js';

export const createTopic = <E extends EntryState>(
  state: EntryStates<E>,
  parameters: TopicParameters
) => {
  const topicName = toKebabCase(parameters.topicName);
  const topicId = hashData(TopicServiceType, topicName);

  return attachEntry<E | TopicState, TopicState>(state, {
    type: TopicServiceType,
    entryId: topicId,
    dependencies: [],
    parameters: {
      ...parameters,
      topicName
    }
  });
};

export const getTopic = <E extends EntryState>(state: EntryStates<E>, topicName: string) => {
  const topicId = createTopicStateId(topicName);
  const topicState = state[topicId];

  if (topicState && isTopicState(topicState)) {
    return topicState;
  }

  return null;
};
