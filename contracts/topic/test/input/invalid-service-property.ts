import type { Topic } from '@ez4/topic';

export declare class TestTopic extends Topic.Service<{}> {
  subscriptions: [];

  // No extra property is allowed
  invalid_property: true;
}
