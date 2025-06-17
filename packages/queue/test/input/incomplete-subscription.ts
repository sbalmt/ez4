import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {}

export declare class TestQueue extends Queue.Service<TestMessage> {
  // @ts-ignore Missing required subscription handler.
  subscriptions: [{}];
}
