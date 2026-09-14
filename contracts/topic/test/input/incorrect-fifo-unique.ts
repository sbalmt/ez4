import type { Topic } from '@ez4/topic';

type TestEvent = {
  group: string;
};

export declare class TestTopic extends Topic.Ordered<TestEvent> {
  // @ts-expect-error Unique property is missing.
  fifoMode: Topic.UseFifoMode<{
    groupId: 'group';
    uniqueId: 'unique';
  }>;

  subscriptions: [];
}
