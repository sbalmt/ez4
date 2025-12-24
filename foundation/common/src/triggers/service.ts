import type { EmulateServiceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';
import type { ReflectionTypes } from '@ez4/reflection';

import { createServiceMetadata, getServiceName } from '@ez4/project/library';

import { Client } from '../client';
import { ServiceName, ServiceType } from '../types/services';
import { prepareLinkedClient } from './client';
import { isCommonService } from './utils';

export const prepareLinkedServices = (event: ServiceEvent) => {
  return isCommonService(event.service) ? prepareLinkedClient() : null;
};

export const prepareCommonServices = (event: PrepareResourceEvent) => {
  return isCommonService(event.service);
};

export const getCommonServices = (_reflection: ReflectionTypes) => {
  return {
    errors: [],
    services: {
      [ServiceName]: createServiceMetadata(ServiceType, ServiceName)
    }
  };
};

export const getCommonEmulators = (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (!isCommonService(service)) {
    return null;
  }

  const { name: serviceName } = service;

  return {
    type: 'Common',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    exportHandler: () => Client.make()
  };
};
