import type { EntryState } from '@ez4/stateful';
import type { MigrationState } from './types.js';

import { MigrationServiceType } from './types.js';

export const isMigrationState = (resource: EntryState): resource is MigrationState => {
  return resource.type === MigrationServiceType;
};
