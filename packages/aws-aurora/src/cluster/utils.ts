import type { EntryState } from '@ez4/stateful';
import type { ClusterState } from './types.js';

import { ClusterServiceType } from './types.js';

export const isClusterState = (resource: EntryState): resource is ClusterState => {
  return resource.type === ClusterServiceType;
};
