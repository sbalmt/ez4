import type { Queue } from '@ez4/queue';

type TestMessage = {
  id: string;
};

export declare class TestQueue extends Queue.Unordered<TestMessage> {
  // @ts-expect-error Missing groupId field.
  fairMode: {};

  subscriptions: [];
}
