import type { AnyObject } from '@ez4/utils';
import type { ServiceDescriptors, ServiceFactories } from '@ez4/emulator';
import type { ServiceNameOptions } from '../utils/service';
import type { ServiceEmulators } from './service';
import type { ServeOptions } from '../types/options';
import type { LinkedVariables } from '../types/service';

import { getLazyContext, getServiceVariables, loadService, notifyProvider } from '@ez4/emulator';
import { Logger } from '@ez4/logger';

import { makeServiceDescriptors, makeServiceReferences } from './service';

export const loadServiceClient = async (
  emulators: ServiceEmulators,
  options: ServiceNameOptions & Pick<ServeOptions, 'variables'>,
  resourceName: string,
  resourceOptions?: AnyObject
): Promise<unknown> => {
  const linkedServices = {
    client: {
      reference: resourceName,
      options: resourceOptions
    }
  };

  const descriptors = makeServiceDescriptors(linkedServices, emulators, options);
  const references = makeServiceReferences(linkedServices, emulators, options);

  const services = await loadServices(descriptors, {
    ...process.env,
    ...options.variables,
    ...getServiceVariables(resourceName, descriptors)
  });

  return getLazyContext(services, references).client;
};

const loadServices = async (descriptors: ServiceDescriptors, variables: Readonly<Partial<LinkedVariables>>): Promise<ServiceFactories> => {
  const services: ServiceFactories = {};

  for (const identifier in descriptors) {
    const descriptor = descriptors[identifier];

    services[identifier] = await loadService(services, descriptor, (provider) => ({
      variables,
      notify: (event: string, payload: AnyObject) => {
        notifyProvider(provider, event, payload).catch((error) => {
          Logger.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
        });
      },
      request: (event: string, payload: AnyObject) => {
        return notifyProvider(provider, event, payload);
      }
    }));
  }

  return services;
};
