import type { EmulateServiceEvent } from '@ez4/project/library';

import { isTopicImport, isTopicService, registerTriggers as registerTopicTriggers } from '@ez4/topic/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerRemoteServices } from './remote';
import { registerLocalServices } from './local';

export const registerTriggers = () => {
  registerTopicTriggers();

  tryCreateTrigger('@ez4/local-topic', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isTopicService(service)) {
        return registerLocalServices(service, options, context);
      }

      if (isTopicImport(service)) {
        return registerRemoteServices(service, options, context);
      }

      return null;
    }
  });
};
