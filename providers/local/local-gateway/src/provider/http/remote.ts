import type { EmulateServiceContext, ServeOptions, ServiceEmulator } from '@ez4/project/library';
import type { HttpImport } from '@ez4/gateway/library';

import { getServiceName, MissingImportedProjectError } from '@ez4/project/library';
import { getClientAuthorization, getClientOperations } from '@ez4/gateway/library';

export const registerHttpRemoteService = (service: HttpImport, options: ServeOptions, _context: EmulateServiceContext): ServiceEmulator => {
  const { name: resourceName, reference: referenceName, project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new MissingImportedProjectError(project);
  }

  const importOptions = imports[project];

  const clientOptions = {
    authorization: getClientAuthorization(service),
    operations: getClientOperations(service),
    identifier: getServiceName(referenceName, importOptions),
    host: importOptions.serviceHost
  };

  return {
    type: 'Gateway',
    name: resourceName,
    options: service.options,
    identifier: getServiceName(resourceName, options),
    exportDescriptor: () => {
      return {
        name: 'makeService',
        module: '@ez4/local-gateway/worker',
        options: {
          ...clientOptions,
          name: referenceName
        }
      };
    }
  };
};
