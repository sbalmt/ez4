import type { EntryState, StepContext } from '@ez4/stateful';
import type { IntegrationState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';

import { IntegrationServiceType } from './types.js';

export const getIntegrationId = <E extends EntryState>(
  serviceName: string,
  resourceId: string,
  context: StepContext<E | IntegrationState>
) => {
  const resource = context.getDependencies(IntegrationServiceType).at(0)?.result;

  if (!resource?.integrationId) {
    throw new IncompleteResourceError(serviceName, resourceId, 'integrationId');
  }

  return resource.integrationId;
};
