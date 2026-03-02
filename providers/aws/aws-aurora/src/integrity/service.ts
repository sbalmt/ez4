import type { EntryState, EntryStates } from '@ez4/stateful';
import type { MigrationState } from '../migration/types';
import type { IntegrityState } from './types';

import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { IntegrityServiceType } from './types';

export const createIntegrity = <E extends EntryState>(state: EntryStates<E>, migrationState: MigrationState) => {
  const integrityId = hashData(IntegrityServiceType, migrationState.entryId);

  const { parameters } = migrationState;

  return attachEntry<E | IntegrityState, IntegrityState>(state, {
    type: IntegrityServiceType,
    entryId: integrityId,
    dependencies: [migrationState.entryId],
    parameters: {
      getRepository: () => parameters.repository,
      getDatabase: () => parameters.database
    }
  });
};
