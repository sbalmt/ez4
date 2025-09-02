import type { EntryState } from '@ez4/stateful';
import type { RouteState } from './types';

import { RouteServiceType } from './types';

export const isRouteState = (resource: EntryState): resource is RouteState => {
  return resource.type === RouteServiceType;
};
