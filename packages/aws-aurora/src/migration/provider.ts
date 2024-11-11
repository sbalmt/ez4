import { registerProvider } from '@ez4/aws-common';

import { getMigrationHandler } from './handler.js';
import { MigrationServiceType } from './types.js';

export const registerMigrationProvider = () => {
  registerProvider(MigrationServiceType, getMigrationHandler());
};
