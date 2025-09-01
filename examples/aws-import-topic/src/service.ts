import type { Sns, FifoSns } from 'hello-aws-topic';
import type { Topic } from '@ez4/topic';
import type { Environment } from '@ez4/common';
import type { FifoSqs, Sqs } from './queue/service';
import type { messageHandlerA } from './lambda/handlers';
import type { serviceListener } from './common';

/**
 * Example of AWS SNS imported and deployed with EZ4.
 */
export declare class ImportedSns extends Topic.Import<Sns> {
  /**
   * Name of the imported project from `ez4.project.js`
   */
  project: 'hello-aws-topic';

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
export declare class ImportedFifoSns extends Topic.Import<FifoSns> {
  /**
   * Name of the imported project from `ez4.project.js`
   */
  project: 'hello-aws-topic';

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
