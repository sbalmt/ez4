import type { EntryState, EntryStates } from '@ez4/stateful';
import type { InstanceParameters, InstanceState } from './types.js';
import type { ClusterState } from '../cluster/types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { InstanceServiceType } from './types.js';

export const createInstance = <E extends EntryState>(state: EntryStates<E>, clusterState: ClusterState, parameters: InstanceParameters) => {
  const instanceName = toKebabCase(parameters.instanceName);
  const instanceId = hashData(InstanceServiceType, instanceName);

  return attachEntry<E | InstanceState, InstanceState>(state, {
    type: InstanceServiceType,
    entryId: instanceId,
    dependencies: [clusterState.entryId],
    parameters: {
      ...parameters,
      instanceName
    }
  });
};
