import type { Queue } from '@ez4/queue';

type TestMessage = {
  id: string;
  user: string;
};

// Concrete class is not allowed.
class TestFairMode implements Queue.FairMode<TestMessage> {
  groupId!: 'user';
}

export declare class TestQueue extends Queue.Unordered<TestMessage> {
  fairMode: TestFairMode;

  subscriptions: [];
}
