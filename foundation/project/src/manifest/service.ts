import type { ProjectManifest, ServiceManifest } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';
import type { ServiceEmulators } from '../emulator/service';
import type { ServeOptions } from '../types/options';

import { getServiceName } from '../utils/service';

export const getServicesManifest = (emulators: ServiceEmulators, options: ServeOptions) => {
  const services: Record<string, ServiceManifest<AnyObject>> = {};

  const namePrefix = getServiceName('', options);

  for (const identifier in emulators) {
    const emulator = emulators[identifier];

    if (emulator?.manifestHandler) {
      const manifestName = identifier.substring(namePrefix.length + 1);

      services[manifestName] = {
        path: `/${identifier}`,
        type: emulator.type,
        ...emulator.manifestHandler()
      };
    }
  }

  return {
    identifier: namePrefix,
    host: options.serviceHost,
    settings: {
      prefix: options.prefix,
      name: options.projectName,
      branch: options.branchName
    },
    services
  } satisfies ProjectManifest<AnyObject>;
};
