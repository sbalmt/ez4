// @ts-nocheck

import type { Topic } from '@ez4/topic';

interface TestEvent extends Topic.Event {}

export declare class TestTopic extends Topic.Unordered<TestEvent> {
  subscriptions: any;
}
