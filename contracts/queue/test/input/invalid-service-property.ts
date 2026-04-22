import type { Queue } from '@ez4/queue';

export declare class TestQueue extends Queue.Unordered<{}> {
  subscriptions: [];

  // No extra property is allowed.
  invalid_property: true;
}
