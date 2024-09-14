import type { CronService } from '@ez4/scheduler/library';
import type { DeployOptions } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

export const getTargetName = (
  service: CronService,
  handlerName: string,
  options: DeployOptions
) => {
  return `${getServiceName(service, options)}-${toKebabCase(handlerName)}`;
};
