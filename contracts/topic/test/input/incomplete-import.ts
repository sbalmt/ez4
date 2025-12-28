import type { Topic } from '@ez4/topic';

interface TestMessage extends Topic.Message {
  foo: string;
}

export declare class TestTopic extends Topic.Service<TestMessage> {
  subscriptions: [];
}

// @ts-expect-error No required properties defined.
export declare class TestImportTopic extends Topic.Import<TestTopic> {}
