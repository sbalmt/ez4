import type { Sns, FifoSns } from 'hello-aws-notification';
import type { Notification } from '@ez4/notification';
import type { Environment } from '@ez4/common';
import type { FifoSqs, Sqs } from './queue/service.js';
import type { messageHandlerA } from './lambda/handlers.js';
import type { serviceListener } from './common.js';

/**
 * Example of AWS SNS imported and deployed with EZ4.
 */
export declare class ImportedSns extends Notification.Import<Sns> {
  /**
   * Name of the imported project from `ez4.project.js`
   */
  project: 'hello-aws-notification';

  /**
   * All handlers for this service.
   */
  subscriptions: [
    {
      listener: typeof serviceListener;
      handler: typeof messageHandlerA;
    }
  ];
}

/**
 * Example of AWS FIFO SNS imported and deployed with EZ4.
 */
export declare class ImportedFifoSns extends Notification.Import<FifoSns> {
  /**
   * Name of the imported project from `ez4.project.js`
   */
  project: 'hello-aws-notification';

  /**
   * All handlers for this service.
   */
  subscriptions: [
    {
      service: Environment.Service<Sqs>;
    },
    {
      service: Environment.Service<FifoSqs>;
    }
  ];
}
