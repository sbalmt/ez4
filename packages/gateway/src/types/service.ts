import type { ServiceMetadata } from '@ez4/project/library';
import type { HttpRoute } from './route.js';

export const ServiceType = '@ez4/http';

export type HttpService = ServiceMetadata & {
  type: typeof ServiceType;
  id: string;
  name: string;
  description?: string;
  routes: HttpRoute[];
};

export const isHttpService = (service: ServiceMetadata): service is HttpService => {
  return service.type === ServiceType;
};
