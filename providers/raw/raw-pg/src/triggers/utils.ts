import type { DatabaseService } from '@ez4/database/library';
import type { ServiceMetadata } from '@ez4/project/library';

import { isDatabaseService } from '@ez4/database/library';
import { toSnakeCase } from '@ez4/utils';

export const isRawPgService = (service: ServiceMetadata): service is DatabaseService => {
  return isDatabaseService(service) && service.engine.name === 'raw-pg';
};

export const getConnectionEnvName = (service: DatabaseService) => {
  return `EZ4_RAW_PG_${toSnakeCase(service.name).toUpperCase()}_URL`;
};
