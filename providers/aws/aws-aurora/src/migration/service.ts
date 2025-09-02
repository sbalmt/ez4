import type { EntryState, EntryStates } from '@ez4/stateful';
import type { MigrationParameters, MigrationState } from './types';
import type { InstanceState } from '../instance/types';
import type { ClusterState } from '../cluster/types';

import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { MigrationServiceType } from './types';

export const createMigration = <E extends EntryState>(
  state: EntryStates<E>,
  clusterState: ClusterState,
  instanceState: InstanceState,
  parameters: MigrationParameters
) => {
  const migrationId = hashData(MigrationServiceType, clusterState.entryId, parameters.database);

  return attachEntry<E | MigrationState, MigrationState>(state, {
    type: MigrationServiceType,
    entryId: migrationId,
    dependencies: [clusterState.entryId, instanceState.entryId],
    parameters
  });
};
