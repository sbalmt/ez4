import type { Queue } from '@ez4/queue';

type TestMessage = {};

export declare class TestQueue extends Queue.Unordered<TestMessage> {
  // @ts-expect-error Missing maxRetries field.
  deadLetter: {};

  subscriptions: [];
}
