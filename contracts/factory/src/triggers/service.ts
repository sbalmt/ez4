import type { PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';
import type { TypeClass } from '@ez4/reflection';

import { isFactoryServiceDeclaration } from '../metadata/service';
import { isFactoryService } from '../metadata/types';
import { prepareLinkedClient } from './client';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isFactoryServiceDeclaration(declaration) ? declaration.name : null;
};

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service } = event;

  if (isFactoryService(service)) {
    return prepareLinkedClient(service);
  }

  return null;
};

export const prepareFactoryResources = (event: PrepareResourceEvent) => {
  return isFactoryService(event.service);
};
