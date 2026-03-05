import type { Queue } from '@ez4/queue';

type TestMessage = {
  foo: string;
};

export declare class TestQueue extends Queue.Ordered<TestMessage> {
  subscriptions: [];

  fifoMode: {
    groupId: 'foo';
  };
}
