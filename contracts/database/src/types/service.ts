import type { ServiceMetadata } from '@ez4/project/library';
import type { DatabaseScalability } from './scalability';
import type { DatabaseEngine } from './engine';
import type { DatabaseTable } from './table';

export const ServiceType = '@ez4/database';

export type DatabaseService = ServiceMetadata & {
  type: typeof ServiceType;
  scalability?: DatabaseScalability | null;
  engine: DatabaseEngine;
  tables: DatabaseTable[];
  name: string;
};

export const isDatabaseService = (service: ServiceMetadata): service is DatabaseService => {
  return service.type === ServiceType;
};
