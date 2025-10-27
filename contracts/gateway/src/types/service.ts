import type { ServiceMetadata } from '@ez4/project/library';
import type { HttpRoute, HttpCors, HttpDefaults, HttpCache, HttpAccess } from './common';

export const ServiceType = '@ez4/http';

export type HttpService = ServiceMetadata & {
  type: typeof ServiceType;
  displayName?: string;
  description?: string;
  defaults?: HttpDefaults;
  routes: HttpRoute[];
  cache?: HttpCache;
  access?: HttpAccess;
  cors?: HttpCors;
};

export const isHttpService = (service: ServiceMetadata): service is HttpService => {
  return service.type === ServiceType;
};
