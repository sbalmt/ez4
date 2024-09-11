import type { CronService } from '@ez4/scheduler/library';
import type { DeployOptions } from '@ez4/project/library';

import { toKebabCase } from '@ez4/utils';

export const getRuleName = (service: CronService, options: DeployOptions) => {
  const resourcePrefix = toKebabCase(options.resourcePrefix);
  const projectName = toKebabCase(options.projectName);
  const ruleName = toKebabCase(service.name);

  return `${resourcePrefix}-${projectName}-${ruleName}`;
};

export const getTargetName = (
  service: CronService,
  handlerName: string,
  options: DeployOptions
) => {
  return `${getRuleName(service, options)}-${toKebabCase(handlerName)}`;
};
