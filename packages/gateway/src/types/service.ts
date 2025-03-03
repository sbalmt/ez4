import type { ServiceMetadata } from '@ez4/project/library';
import type { HttpRoute, HttpCors, HttpDefaults } from './common.js';

export const ServiceType = '@ez4/http';

export type HttpService = ServiceMetadata & {
  type: typeof ServiceType;
  displayName?: string;
  description?: string;
  defaults?: HttpDefaults;
  routes: HttpRoute[];
  cors?: HttpCors;
};

export const isHttpService = (service: ServiceMetadata): service is HttpService => {
  return service.type === ServiceType;
};
