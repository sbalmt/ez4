import type { EntryState, EntryStates } from '@ez4/stateful';
import type { ClusterParameters, ClusterState } from './types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { ClusterServiceType } from './types.js';

export const createCluster = <E extends EntryState>(
  state: EntryStates<E>,
  parameters: ClusterParameters
) => {
  const clusterName = toKebabCase(parameters.clusterName);
  const clusterId = hashData(ClusterServiceType, clusterName);

  return attachEntry<E | ClusterState, ClusterState>(state, {
    type: ClusterServiceType,
    entryId: clusterId,
    dependencies: [],
    parameters: {
      ...parameters,
      clusterName
    }
  });
};
