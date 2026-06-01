import type { AnyObject } from '@ez4/utils';
import type { EmulatorLinkedServices, ServiceEmulator, EmulatorServiceClients } from './types';
import type { MetadataReflection } from '../types/metadata';
import type { ServeOptions } from '../types/options';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';
import { hashObject, isAnyString } from '@ez4/utils';

import { MissingEmulatorProvider } from './errors';

export type ServiceEmulators = Record<string, ServiceEmulator>;

export const getServiceEmulators = async (metadata: MetadataReflection, options: ServeOptions) => {
  const clientsCache: Record<string, EmulatorServiceClients> = {};
  const emulators: ServiceEmulators = {};

  const context = {
    makeClient: (resourceName: string, resourceOptions?: AnyObject) => {
      return makeEmulatorClient(resourceName, resourceOptions, undefined, emulators, options);
    },
    makeClients: (linkedServices: EmulatorLinkedServices, linkedOptions?: AnyObject) => {
      const clientKey = hashObject({ linkedServices, linkedOptions });

      if (!clientsCache[clientKey]) {
        clientsCache[clientKey] = {};

        const allClients = makeEmulatorClients(linkedServices, linkedOptions, emulators, options);

        Object.assign(clientsCache[clientKey], allClients);
      }

      return makeLazyClients(clientsCache[clientKey]);
    }
  };

  for (const identity in metadata) {
    const service = metadata[identity];

    const result = await triggerAllAsync('emulator:getServices', (handler) =>
      handler({
        service,
        options,
        context
      })
    );

    if (!result) {
      throw new MissingEmulatorProvider(service.name);
    }

    if (result) {
      emulators[result.identifier] = result;
    }
  }

  return emulators;
};

const makeEmulatorClients = (
  linkedServices: EmulatorLinkedServices,
  linkedOptions: AnyObject | undefined,
  emulators: ServiceEmulators,
  options: ServeOptions
) => {
  const allClients: EmulatorServiceClients = {};

  for (const linkedServiceName in linkedServices) {
    const { reference: resourceName, options: resourceOptions } = linkedServices[linkedServiceName];

    const resourceClient = makeEmulatorClient(resourceName, resourceOptions, linkedOptions, emulators, options);

    allClients[linkedServiceName] = resourceClient;
  }

  return allClients;
};

const makeEmulatorClient = (
  resourceName: string,
  resourceOptions: AnyObject | undefined,
  linkedOptions: AnyObject | undefined,
  emulators: ServiceEmulators,
  options: ServeOptions
) => {
  const serviceName = getServiceName(resourceName, options);
  const serviceEmulator = emulators[serviceName];

  if (!serviceEmulator) {
    throw new Error(`Service '${resourceName}' has no emulators.`);
  }

  const serviceClient = serviceEmulator.exportHandler?.({
    ...(serviceEmulator.inheritOptions && linkedOptions),
    ...serviceEmulator.options,
    ...resourceOptions
  });

  if (!serviceClient) {
    throw new Error(`Service '${resourceName}' has no client emulator.`);
  }

  return serviceClient;
};

const makeLazyClients = (clients: EmulatorServiceClients) => {
  return new Proxy(clients, {
    get: (target, property) => {
      if (!isAnyString(property) || !(property in target)) {
        if (property !== 'then') {
          throw new Error(`Context service '${property.toString()}' not found.`);
        }

        return undefined;
      }

      if (target[property] instanceof Function) {
        target[property] = target[property]();
      }

      return target[property];
    }
  });
};
