import type { EntryState, EntryStates } from '@ez4/stateful';
import type { InstanceParameters, InstanceState } from './types';
import type { ClusterState } from '../cluster/types';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { InstanceServiceType } from './types';

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
