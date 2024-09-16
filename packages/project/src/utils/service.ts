import type { ServiceMetadata } from '../types/service.js';
import type { DeployOptions } from '../types/deploy.js';

import { toKebabCase } from '@ez4/utils';

import { isServiceMetadata } from '../types/service.js';

export const getServiceName = (service: ServiceMetadata | string, options: DeployOptions) => {
  const resourcePrefix = toKebabCase(options.resourcePrefix);
  const projectName = toKebabCase(options.projectName);

  const servicePrefix = `${resourcePrefix}-${projectName}`;

  if (isServiceMetadata(service)) {
    return `${servicePrefix}-${toKebabCase(service.name)}`;
  }

  return `${servicePrefix}-${toKebabCase(service)}`;
};
