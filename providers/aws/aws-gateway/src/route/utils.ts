import type { EntryState, StepContext } from '@ez4/stateful';
import type { RouteState } from './types';

import { RouteServiceType } from './types';
import { IncompleteResourceError } from '@ez4/aws-common';

export const isRouteState = (resource: EntryState): resource is RouteState => {
  return resource.type === RouteServiceType;
};

export const getRouteId = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<RouteState>(RouteServiceType).at(0)?.result;

  if (!resource?.routeId) {
    throw new IncompleteResourceError(serviceName, resourceId, 'routeId');
  }

  return resource.routeId;
};
