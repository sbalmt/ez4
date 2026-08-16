import type { Topic } from '@ez4/topic';

export declare class TestTopic extends Topic.Unordered<{}> {
  subscriptions: [];

  tags: Topic.UseTags<{
    FOO: 'foo';
    BAR: 'bar';
  }>;
}
