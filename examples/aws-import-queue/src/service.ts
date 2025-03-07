import type { Sqs } from 'hello-aws-queue';
import type { Queue } from '@ez4/queue';
import type { messageHandler } from './handlers.js';
import type { queueListener } from './common.js';

/**
 * Example of AWS SQS imported and deployed with EZ4.
 */
export declare class ImportedSqs extends Queue.Import<Sqs> {
  /**
   * Name of the imported project from `ez4.project.js`
   */
  project: 'hello-aws-queue';

  /**
   * All handlers for this queue.
   */
  subscriptions: [
    {
      listener: typeof queueListener;
      handler: typeof messageHandler;
    }
  ];
}
