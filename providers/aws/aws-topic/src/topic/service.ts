import type { EntryState, EntryStates } from '@ez4/stateful';
import type { TopicParameters, TopicState } from './types';

import { attachEntry } from '@ez4/stateful';
import { toKebabCase } from '@ez4/utils';

import { createTopicStateId, isTopicState } from './utils';
import { TopicServiceType } from './types';

export const createTopic = <E extends EntryState>(state: EntryStates<E>, parameters: TopicParameters) => {
  const localName = toKebabCase(parameters.topicName);
  const topicName = parameters.fifoMode ? `${localName}.fifo` : localName;

  const topicId = createTopicStateId(topicName, false);

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
