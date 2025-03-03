import type { QueueImport, QueueService } from '@ez4/queue/library';
import type { DeployOptions } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

export const getFunctionName = (
  service: QueueService | QueueImport,
  handlerName: string,
  options: DeployOptions
) => {
  return `${getServiceName(service, options)}-${toKebabCase(handlerName)}`;
};
