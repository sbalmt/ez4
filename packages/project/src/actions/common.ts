import type { ServiceAliases, ServiceMetadata } from '@ez4/project/library';
import type { EntryState } from '@ez4/stateful';
import type { DeployOptions } from '../types/options.js';

import { getServiceState, setServiceState } from '@ez4/project/library';

export const getEventContext = (aliases: ServiceAliases) => {
  return {
    getServiceState: (service: ServiceMetadata | string, options: DeployOptions) => {
      return getServiceState(aliases, service, options);
    },
    setServiceState: (state: EntryState, service: ServiceMetadata | string, options: DeployOptions) => {
      setServiceState(aliases, state, service, options);
    }
  };
};
