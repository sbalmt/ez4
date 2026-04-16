import type { Queue } from '@ez4/queue';

type TestMessage = {
  id: string;
  user: string;
};

export declare class TestQueue extends Queue.Unordered<TestMessage> {
  fairMode: Queue.UseFairMode<{
    groupId: 'user';

    // No extra property is allowed.
    invalid_property: true;
  }>;

  subscriptions: [];
}
