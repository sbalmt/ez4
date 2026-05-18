import { ServiceError } from '@ez4/common';

export class LocalQueueOptionsNotFoundError extends ServiceError {
  constructor() {
    super('Local queue options were not found in project configuration.', {
      context: {
        details: ['Define localOptions.queue with host and port for ElasticMQ.']
      }
    });
  }
}
