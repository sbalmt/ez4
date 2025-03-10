import type { QueueImport, QueueService } from '@ez4/queue/library';
import type { DeployOptions } from '@ez4/project/library';

import { isQueueImport } from '@ez4/queue/library';
import { getServiceName } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

export const getQueueName = (service: QueueService | QueueImport, options: DeployOptions) => {
  return getServiceName(isQueueImport(service) ? service.reference : service, options);
};

export const getInternalName = (service: QueueService | QueueImport, handlerName: string) => {
  return `${toKebabCase(service.name)}-${toKebabCase(handlerName)}`;
};

export const getFunctionName = (service: QueueService | QueueImport, handlerName: string, options: DeployOptions) => {
  return `${getServiceName(service, options)}-${toKebabCase(handlerName)}`;
};
