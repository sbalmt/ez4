import type { EmulateServiceEvent } from '@ez4/project/library';

import { isQueueService, registerTriggers as registerQueueTriggers } from '@ez4/queue/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerElasticMqEmulator } from './emulator';

export const registerTriggers = () => {
  registerQueueTriggers();

  tryCreateTrigger('@ez4/local-elasticmq', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (!isQueueService(service)) {
        return null;
      }

      return registerElasticMqEmulator(service, options, context);
    }
  });
};
