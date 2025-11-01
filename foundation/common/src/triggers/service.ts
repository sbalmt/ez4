import type { EmulateServiceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';
import type { SourceMap } from '@ez4/reflection';

import { getServiceName } from '@ez4/project/library';

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

export const getCommonServices = (_reflection: SourceMap) => {
  return {
    errors: [],
    services: {
      [ServiceName]: {
        type: ServiceType,
        name: ServiceName,
        extras: {}
      }
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
    clientHandler: () => Client.make()
  };
};
