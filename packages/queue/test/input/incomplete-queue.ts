import type { Queue } from '@ez4/queue';

// @ts-ignore Missing required queue subscriptions.
export declare class TestQueue1 extends Queue.Service {
  name: 'Test Queue 1';

  schema: {};
}

// @ts-ignore Missing required queue schema.
export declare class TestService2 extends Queue.Service {
  name: 'Test Queue 2';

  subscriptions: [];
}

// @ts-ignore Missing required queue name.
export declare class TestService3 extends Queue.Service {
  schema: {};

  subscriptions: [];
}
