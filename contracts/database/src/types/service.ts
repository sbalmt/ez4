import type { ServiceMetadata } from '@ez4/project/library';
import type { DatabaseScalability } from './scalability';
import type { DatabaseEngine } from './engine';
import type { DatabaseTable } from './table';

import { createServiceMetadata } from '@ez4/project/library';

export const ServiceType = '@ez4/database';

export type DatabaseService = Omit<ServiceMetadata, 'variables' | 'services'> &
  Required<Pick<ServiceMetadata, 'variables' | 'services'>> & {
    type: typeof ServiceType;
    scalability?: DatabaseScalability;
    engine: DatabaseEngine;
    tables: DatabaseTable[];
    name: string;
  };

export const isDatabaseService = (service: ServiceMetadata): service is DatabaseService => {
  return service.type === ServiceType;
};

export const createDatabaseService = (name: string) => {
  return {
    ...createServiceMetadata<DatabaseService>(ServiceType, name),
    variables: {},
    services: {}
  };
};
