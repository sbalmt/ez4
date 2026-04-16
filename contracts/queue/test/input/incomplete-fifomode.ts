import type { Queue } from '@ez4/queue';

type TestMessage = {
  id: string;
  user: string;
};

export declare class TestQueue extends Queue.Ordered<TestMessage> {
  // @ts-expect-error Missing groupId field.
  fifoMode: {
    uniqueId: 'id';
  };

  subscriptions: [];
}
