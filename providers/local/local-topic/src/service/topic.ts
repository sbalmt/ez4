import type { TopicRemoteSubscription } from '../types/subscription';

import { TopicEmulatorSubscriptionType } from '../types/subscription';

const ALL_TOPICS: Record<string, Record<string, TopicRemoteSubscription>> = {};

export namespace InMemoryTopic {
  export type TopicSubscription = Omit<TopicRemoteSubscription, 'type'>;

  export const createSubscription = (topicName: string, identifier: string, subscription: TopicSubscription) => {
    if (!ALL_TOPICS[topicName]) {
      ALL_TOPICS[topicName] = {};
    }

    ALL_TOPICS[topicName][identifier] = {
      type: TopicEmulatorSubscriptionType.Remote,
      ...subscription
    };
  };

  export const deleteSubscription = (topicName: string, identifier: string) => {
    const topicSubscriptions = ALL_TOPICS[topicName];

    if (topicSubscriptions) {
      delete topicSubscriptions[identifier];
    }
  };

  export const getSubscriptions = (topicName: string) => {
    const topicSubscriptions = ALL_TOPICS[topicName];

    if (topicSubscriptions) {
      return Object.values(topicSubscriptions);
    }

    return [];
  };
}
