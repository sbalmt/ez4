import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {
  foo: string;
}

export declare class TestQueue extends Queue.Unordered<TestMessage> {
  subscriptions: [];
}

// @ts-expect-error No required properties defined.
export declare class TestImportQueue extends Queue.Import<TestQueue> {}
