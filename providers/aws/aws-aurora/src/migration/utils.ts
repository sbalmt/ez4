import type { EntryState, StepContext } from '@ez4/stateful';
import type { MigrationState } from './types';

import { IncompleteResourceError } from '@ez4/aws-common';

import { MigrationServiceType } from './types';

export const isMigrationState = (resource: EntryState): resource is MigrationState => {
  return resource.type === MigrationServiceType;
};

export const getMigrationResult = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<MigrationState>(MigrationServiceType).at(0);

  if (!resource?.result) {
    throw new IncompleteResourceError(serviceName, resourceId, 'result');
  }

  const { clusterArn, secretArn } = resource.result;

  return {
    clusterArn,
    secretArn
  };
};
