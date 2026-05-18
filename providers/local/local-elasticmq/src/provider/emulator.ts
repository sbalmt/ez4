import type { SQSClient } from '@aws-sdk/client-sqs';
import type { Client } from '@ez4/queue';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { QueueService } from '@ez4/queue/library';
import type { AnyObject } from '@ez4/utils';

import { getServiceName } from '@ez4/project/library';
import { Logger } from '@ez4/logger';
import { getRandomInteger } from '@ez4/utils';

import { processQueueMessage } from '@ez4/local-common';

import { createElasticMqQueueClient, getElasticMqClient } from './client';
import { getElasticMqOptions } from './options';
import { ensureQueueTopology, getQueueName, purgeQueueTopology } from './queues';
import { createQueuePoller, stopQueuePoller } from './poller';

export const registerElasticMqEmulator = (service: QueueService, options: ServeOptions, _context: EmulateServiceContext) => {
  const identifier = getServiceName(service.name, options);
  const elasticMqOptions = getElasticMqOptions(options);
  const sqsClient = getElasticMqClient(elasticMqOptions.endpoint);
  const isFifo = !!service.fifoMode;
  const queueName = getQueueName(identifier, isFifo);
  const queueUrl = `${elasticMqOptions.endpoint}/${queueName}`;

  const queueClient: Client<any, any> = createElasticMqQueueClient(queueUrl, service.schema, sqsClient, {
    fifoMode: service.fifoMode,
    fairMode: service.fairMode
  });

  return {
    type: 'Queue' as const,
    name: service.name,
    identifier,
    exportHandler: () => queueClient,
    prepareHandler: () => runQueueReset(service, sqsClient, options),
    bootstrapHandler: () => runStartQueue(service, sqsClient, identifier, queueUrl, options),
    shutdownHandler: () => runStopQueue(identifier)
  };
};

const runQueueReset = async (service: QueueService, sqsClient: SQSClient, options: ServeOptions) => {
  if (options.local && options.reset) {
    Logger.warn(`Queue [${service.name}] was reset.`);

    await purgeQueueTopology(sqsClient, service, options);
  }
};

const runStartQueue = async (service: QueueService, sqsClient: SQSClient, identifier: string, queueUrl: string, options: ServeOptions) => {
  await ensureQueueTopology(sqsClient, service, options);

  const poller = createQueuePoller({
    key: identifier,
    client: sqsClient,
    queueUrl,
    waitTime: 1,
    maxMessages: 10,
    dispatch: async (message) => {
      return dispatchToSubscribers(service, options, message);
    }
  });

  poller.start();
};

const runStopQueue = (identifier: string) => {
  stopQueuePoller(identifier);
};

const dispatchToSubscribers = async (service: QueueService, options: ServeOptions, message: AnyObject) => {
  const subscriptionIndex = getRandomInteger(0, service.subscriptions.length - 1);
  const queueSubscription = service.subscriptions[subscriptionIndex];

  if (queueSubscription) {
    const mockContext: EmulateServiceContext = {
      makeClients: (_linkedServices) => Promise.resolve({}),
      makeClient: (_serviceName) => Promise.resolve(null)
    };

    await processQueueMessage(service, options, mockContext, queueSubscription, message);
  }
};
