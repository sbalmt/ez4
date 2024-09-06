import type { QueueService } from '@ez4/queue/library';
import type { DeployOptions } from '@ez4/project/library';

import { toKebabCase } from '@ez4/utils';

export const getQueueName = (service: QueueService, options: DeployOptions) => {
  const resourcePrefix = toKebabCase(options.resourcePrefix);
  const projectName = toKebabCase(options.projectName);
  const queueName = toKebabCase(service.name);

  return `${resourcePrefix}-${projectName}-${queueName}`;
};

export const getMappingName = (
  service: QueueService,
  handlerName: string,
  options: DeployOptions
) => {
  return `${getQueueName(service, options)}-${toKebabCase(handlerName)}`;
};
