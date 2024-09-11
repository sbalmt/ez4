import type { Queue } from '@ez4/queue';

// @ts-ignore Missing required queue subscriptions.
export declare class TestQueue1 extends Queue.Service {
  schema: {};
}

// @ts-ignore Missing required queue schema.
export declare class TestQueue2 extends Queue.Service {
  subscriptions: [];
}
