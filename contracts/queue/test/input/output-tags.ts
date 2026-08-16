import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {}

export declare class TestQueue extends Queue.Unordered<TestMessage> {
  subscriptions: [];

  tags: Queue.UseTags<{
    FOO: 'foo';
    BAR: 'bar';
  }>;
}
