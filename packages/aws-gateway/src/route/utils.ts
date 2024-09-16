import type { EntryState } from '@ez4/stateful';
import type { RouteState } from './types.js';

import { RouteServiceType } from './types.js';

export const isRouteState = (resource: EntryState): resource is RouteState => {
  return resource.type === RouteServiceType;
};
