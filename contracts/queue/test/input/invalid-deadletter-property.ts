import type { Queue } from '@ez4/queue';

type TestMessage = {};

export declare class TestQueue extends Queue.Service<TestMessage> {
  deadLetter: Queue.UseDeadLetter<{
    maxRetries: 2;

    // No extra property is allowed.
    invalid_property: true;
  }>;

  subscriptions: [];
}
