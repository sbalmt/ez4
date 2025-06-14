import type { Queue } from '@ez4/queue';

type TestMessage = {
  id: string;
  user: string;
};

export declare class TestQueue extends Queue.Service<TestMessage> {
  // @ts-ignore Missing groupId field.
  fifoMode: {
    uniqueId: 'id';
  };

  subscriptions: [];
}
