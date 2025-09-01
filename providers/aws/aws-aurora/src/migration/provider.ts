import { registerProvider } from '@ez4/aws-common';

import { getMigrationHandler } from './handler';
import { MigrationServiceType } from './types';

export const registerMigrationProvider = () => {
  registerProvider(MigrationServiceType, getMigrationHandler());
};
