import type { MetadataDependencies, ServiceMetadata } from '@ez4/project/library';
import type { EntryState } from '@ez4/stateful';
import type { DeployOptions } from '../types/options.js';

import { getServiceState, setServiceState } from '@ez4/project/library';

export const getEventContext = (dependencies: MetadataDependencies, role: EntryState | null) => {
  const aliases = {};

  return {
    role,
    getServiceState: (service: ServiceMetadata | string, options: DeployOptions) => {
      return getServiceState(aliases, service, options);
    },
    setServiceState: (state: EntryState, service: ServiceMetadata | string, options: DeployOptions) => {
      setServiceState(aliases, state, service, options);
    },
    getDependencies: (fileName: string) => {
      return dependencies[fileName] ?? [];
    }
  };
};
