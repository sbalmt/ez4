import type { ServiceMetadata } from '@ez4/project/library';
import type { DatabaseTable } from './table.js';

export const ServiceType = '@ez4/database';

export type DatabaseService = ServiceMetadata & {
  type: typeof ServiceType;
  name: string;
  engine: string;
  tables: DatabaseTable[];
};

export const isDatabaseService = (service: ServiceMetadata): service is DatabaseService => {
  return service.type === ServiceType;
};
