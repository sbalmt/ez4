import type { DatabaseService } from '@ez4/database/library';
import type { ServiceMetadata } from '@ez4/project/library';

import { isDatabaseService } from '@ez4/database/library';

export const isRawPgService = (service: ServiceMetadata): service is DatabaseService => {
  return isDatabaseService(service) && service.engine.name === 'raw-pg';
};
