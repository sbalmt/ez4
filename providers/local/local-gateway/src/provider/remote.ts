import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { HttpImport } from '@ez4/gateway/library';

import { getServiceName, MissingImportedProjectError } from '@ez4/project/library';
import { getClientAuthorization, getClientOperations } from '@ez4/gateway/library';

import { createServiceClient } from '../client/service';

export const registerRemoteServices = (service: HttpImport, options: ServeOptions, _context: EmulateServiceContext) => {
  const { name: serviceName, reference: referenceName, project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new MissingImportedProjectError(project);
  }

  const clientOptions = {
    authorization: getClientAuthorization(service),
    operations: getClientOperations(service),
    ...imports[project]
  };

  return {
    type: 'Gateway',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    exportHandler: () => {
      return createServiceClient(referenceName, clientOptions);
    }
  };
};
