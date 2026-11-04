import type { ServiceMetadata } from '@ez4/project/library';

import { isHttpService, isWsService } from '@ez4/gateway/library';

export const hasGatewayLambdaServices = (services: ServiceMetadata[]) => {
  return services.some((service) => {
    return isWsService(service) || (isHttpService(service) && service.routes.some((route) => !route.disabled));
  });
};
