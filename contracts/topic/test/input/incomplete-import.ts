import type { Topic } from '@ez4/topic';

interface TestEvent extends Topic.Event {
  foo: string;
}

export declare class TestTopic extends Topic.Unordered<TestEvent> {
  subscriptions: [];
}

// @ts-expect-error No required properties defined.
export declare class TestImportTopic extends Topic.Import<TestTopic> {}
