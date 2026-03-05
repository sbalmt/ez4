import type { Environment } from '@ez4/common';
import type { Queue } from '@ez4/queue';
import type { Topic } from '@ez4/topic';

export declare class TestQueue extends Queue.Unordered<{}> {
  subscriptions: [];
}

export declare class TestTopic extends Topic.Unordered<{}> {
  subscriptions: [
    Topic.UseSubscription<{
      service: Environment.Service<TestQueue>;
    }>
  ];
}
