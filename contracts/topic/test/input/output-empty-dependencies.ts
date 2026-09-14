import type { Topic } from '@ez4/topic';
import type { Service } from '@ez4/common';

interface TestEvent extends Topic.Event {
  value: string;
}

export declare class TestTopic extends Topic.Unordered<TestEvent> {
  subscriptions: [
    Topic.UseSubscription<{
      handler: typeof handler;
    }>
  ];
}

export function handler(_request: Topic.Incoming<TestEvent>, {}: Service.Context<TestTopic>) {}
