import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {}

// @ts-expect-error Missing required queue subscriptions.
export declare class TestQueue1 extends Queue.Service<TestMessage> {}

// @ts-expect-error Missing required queue schema.
export declare class TestQueue2 extends Queue.Service {
  subscriptions: [];
}
