import type { Topic } from '@ez4/topic';

type TestEvent = {
  unique: string;
};

export declare class TestTopic extends Topic.Ordered<TestEvent> {
  // @ts-expect-error Group property is missing
  fifoMode: Topic.UseFifoMode<{
    groupId: 'group';
    uniqueId: 'unique';
  }>;

  subscriptions: [];
}
