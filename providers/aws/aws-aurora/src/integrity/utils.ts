import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryState } from '@ez4/state';
import type { IntegrityState } from './types';

import { IntegrityServiceType } from './types';
import { IntegrityStateNotFoundError } from './errors';

export const isIntegrityState = (resource: EntryState): resource is IntegrityState => {
  return resource.type === IntegrityServiceType;
};

export const getIntegrityState = (context: EventContext, serviceName: string, options: DeployOptions) => {
  const integrityState = context.getServiceState(serviceName, options);

  if (!isIntegrityState(integrityState)) {
    throw new IntegrityStateNotFoundError(serviceName);
  }

  return integrityState;
};
