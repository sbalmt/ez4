import type { Queue } from '@ez4/queue';

export declare class TestQueue extends Queue.Service {
  name: 'Test Queue';

  schema: {};

  // @ts-ignore Missing required subscription handler.
  subscriptions: [{}];
}
