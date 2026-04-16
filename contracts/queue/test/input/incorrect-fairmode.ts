import type { Queue } from '@ez4/queue';

type TestMessage = {
  id: string;
  user: string;
};

// Missing Queue.FairMode inheritance.
declare class TestFairMode {
  groupId: 'user';
}

export declare class TestQueue1 extends Queue.Unordered<TestMessage> {
  fairMode: TestFairMode;

  subscriptions: [];
}

export declare class TestQueue2 extends Queue.Unordered<TestMessage> {
  // @ts-expect-error Group Id doesn't exist in TestMessage.
  fairMode: {
    groupId: 'wrong';
  };

  subscriptions: [];
}
