import type { EmulateServiceEvent } from '@ez4/project/library';

import { isTopicImport, isTopicService, registerTriggers as registerTopicTriggers } from '@ez4/topic/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerRemoteService } from './remote';
import { registerLocalService } from './local';

export const registerTriggers = () => {
  registerTopicTriggers();

  tryCreateTrigger('@ez4/local-topic', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isTopicService(service)) {
        return registerLocalService(service, options, context);
      }

      if (isTopicImport(service)) {
        return registerRemoteService(service, options, context);
      }

      return null;
    }
  });
};
