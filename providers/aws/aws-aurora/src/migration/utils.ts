import type { EntryState } from '@ez4/stateful';
import type { MigrationState } from './types';

import { MigrationServiceType } from './types';

export const isMigrationState = (resource: EntryState): resource is MigrationState => {
  return resource.type === MigrationServiceType;
};
