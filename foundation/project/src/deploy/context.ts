import type { MetadataDependencies, ServiceMetadata } from '@ez4/project/library';
import type { EntryState } from '@ez4/stateful';
import type { DeployOptions } from '../types/options';

import { getServiceState, setServiceState, tryGetServiceState } from '@ez4/project/library';

export const getEventContext = (dependencies: MetadataDependencies, role: EntryState | null) => {
  const regular = {};
  const virtual = {};

  return {
    role,
    setServiceState: (service: ServiceMetadata | string, options: DeployOptions, state: EntryState) => {
      setServiceState(regular, state, service, options);
    },
    getServiceState: (service: ServiceMetadata | string, options: DeployOptions) => {
      return getServiceState(regular, service, options);
    },
    setVirtualServiceState: (service: ServiceMetadata | string, options: DeployOptions, state: EntryState) => {
      setServiceState(virtual, state, service, options);
    },
    getVirtualServiceState: (service: ServiceMetadata | string, options: DeployOptions) => {
      return tryGetServiceState(virtual, service, options);
    },
    getDependencyFiles: (fileName: string) => {
      return dependencies[fileName] ?? [];
    }
  };
};
