import type { EntryState, StepContext } from '@ez4/stateful';
import type { IntegrationState } from './types';

import { IncompleteResourceError } from '@ez4/aws-common';

import { IntegrationServiceType } from './types';

export const isIntegrationState = (resource: EntryState): resource is IntegrationState => {
  return resource.type === IntegrationServiceType;
};

export const getIntegrationId = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<IntegrationState>(IntegrationServiceType).at(0)?.result;

  if (!resource?.integrationId) {
    throw new IncompleteResourceError(serviceName, resourceId, 'integrationId');
  }

  return resource.integrationId;
};
