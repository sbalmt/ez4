import type { LinkedServices } from '@ez4/project/library';
import type { AuthHandler } from '../auth/types';
import type { HttpHandler } from '../http/types';

import { ServiceCollisionError } from '../../errors/service';
import { attachValidatorLinkedServices } from './validator';

export const attachProviderLinkedServices = (
  handler: HttpHandler | AuthHandler,
  services: LinkedServices,
  errorList: Error[],
  fileName?: string
) => {
  const { provider, request } = handler;

  if (!provider?.services) {
    return;
  }

  if (request) {
    attachValidatorLinkedServices(handler, provider.services);
  }

  for (const serviceName in provider.services) {
    const handlerServiceType = provider.services[serviceName];
    const currentServiceType = services[serviceName];

    if (!currentServiceType) {
      services[serviceName] = handlerServiceType;
      continue;
    }

    if (currentServiceType !== handlerServiceType) {
      errorList.push(new ServiceCollisionError(serviceName, fileName));
    }
  }
};
