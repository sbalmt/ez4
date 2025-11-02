import type { ServiceMetadata } from '@ez4/project/library';
import type { HttpRoute, HttpDefaults } from './common';

export const ImportType = '@ez4/import:http';

export type HttpImport = ServiceMetadata & {
  type: typeof ImportType;
  reference: string;
  project: string;
  displayName?: string;
  description?: string;
  defaults?: HttpDefaults;
  routes: HttpRoute[];
};

export const isHttpImport = (service: ServiceMetadata): service is HttpImport => {
  return service.type === ImportType;
};
