import type { Queue } from '@ez4/queue';

type TestMessage = {
  group: string;
};

export declare class TestQueue extends Queue.Ordered<TestMessage> {
  // @ts-expect-error Unique property is missing.
  fifoMode: Queue.UseFifoMode<{
    groupId: 'group';
    uniqueId: 'unique';
  }>;

  subscriptions: [];
}
