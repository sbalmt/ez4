import type { SourceMap, TypeClass } from '@ez4/reflection';

import { isHttpImport, isHttpService } from '../metadata/utils';
import { getWsServices, isWsServiceDeclaration } from '../metadata/ws/service';
import { getHttpServices } from '../metadata/service';

export const getServices = (reflection: SourceMap) => {
  const httpServices = getHttpServices(reflection);
  const wsServices = getWsServices(reflection);

  return {
    services: {
      ...httpServices.services,
      ...wsServices.services
    },
    errors: [...httpServices.errors, ...wsServices.errors]
  };
};

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isHttpService(declaration) || isWsServiceDeclaration(declaration) ? declaration.name : null;
};

export const getLinkedImport = (declaration: TypeClass): string | null => {
  return isHttpImport(declaration) || isWsServiceDeclaration(declaration) ? declaration.name : null;
};
