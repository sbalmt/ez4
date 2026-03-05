import type { Queue } from '@ez4/queue';

type TestMessage = {
  id: string;
  user: string;
};

export declare class TestQueue extends Queue.Ordered<TestMessage> {
  fifoMode: Queue.UseFifoMode<{
    groupId: 'user';
    uniqueId: 'id';

    // No extra property is allowed.
    invalid_property: true;
  }>;

  subscriptions: [];
}
