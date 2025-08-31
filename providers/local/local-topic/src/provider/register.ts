import type { EmulateServiceEvent } from '@ez4/project/library';

import { isTopicImport, isTopicService, registerTriggers as registerTopicTriggers } from '@ez4/topic/library';
import { createTrigger } from '@ez4/project/library';

import { registerTopicServices } from './emulator.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerTopicTriggers();

  createTrigger('@ez4/local-topic', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isTopicService(service) || isTopicImport(service)) {
        return registerTopicServices(service, options, context);
      }

      return null;
    }
  });

  isRegistered = true;
};
