import type { Queue } from '@ez4/queue';

type TestMessage = {
  unique: string;
};

export declare class TestQueue extends Queue.Ordered<TestMessage> {
  // @ts-expect-error Group property is missing.
  fifoMode: Queue.UseFifoMode<{
    groupId: 'group';
    uniqueId: 'unique';
  }>;

  subscriptions: [];
}
