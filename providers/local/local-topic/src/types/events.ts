import type { Topic } from '@ez4/topic';

export const enum ProviderEvent {
  PublishEvent = 'publish-event'
}

export type ProviderTopicEvent = {
  event: Topic.Event;
};
