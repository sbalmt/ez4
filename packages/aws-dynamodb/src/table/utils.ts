import type { EntryState, StepContext } from '@ez4/stateful';
import type { TableState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';

import { TableServiceType } from './types.js';

export const isTableState = (resource: EntryState): resource is TableState => {
  return resource.type === TableServiceType;
};

export const getStreamArn = <E extends EntryState>(
  serviceName: string,
  resourceId: string,
  context: StepContext<E | TableState>
) => {
  const resource = context.getDependencies(TableServiceType).at(0)?.result;

  if (!resource?.streamArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'streamArn');
  }

  return resource.streamArn;
};
