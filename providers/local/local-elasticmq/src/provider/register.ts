import type { EmulateClientEvent, EmulateServiceEvent } from '@ez4/project/library';

import { isQueueService, registerTriggers as registerQueueTriggers } from '@ez4/queue/library';
import { getServiceName, tryCreateTrigger } from '@ez4/project/library';

import { createElasticMqQueueClient, getElasticMqClient } from './client';
import { getElasticMqOptions } from './options';
import { getQueueName } from './queues';
import { registerElasticMqEmulator } from './emulator';

export const registerTriggers = () => {
  registerQueueTriggers();

  tryCreateTrigger('@ez4/local-elasticmq', {
    'emulator:clientFactory': ({ service, options }: EmulateClientEvent) => {
      if (!isQueueService(service)) {
        return null;
      }

      const elasticMqOptions = getElasticMqOptions(options);
      const sqsClient = getElasticMqClient(elasticMqOptions.endpoint);
      const isFifo = !!service.fifoMode;
      const identifier = getServiceName(service.name, options);
      const queueName = getQueueName(identifier, isFifo);
      const queueUrl = `${elasticMqOptions.endpoint}/${queueName}`;

      return {
        make: () => {
          return createElasticMqQueueClient(queueUrl, service.schema, sqsClient, {
            fifoMode: service.fifoMode,
            fairMode: service.fairMode
          });
        }
      };
    },
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (!isQueueService(service)) {
        return null;
      }

      return registerElasticMqEmulator(service, options, context);
    }
  });
};
