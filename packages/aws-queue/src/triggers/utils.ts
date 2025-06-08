import type { QueueImport, QueueService } from '@ez4/queue/library';
import type { DeployOptions } from '@ez4/project/library';

import { isQueueImport } from '@ez4/queue/library';
import { getServiceName } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

export const getQueueName = (service: QueueService | QueueImport, options: DeployOptions) => {
  return getServiceName(isQueueImport(service) ? service.reference : service, options);
};

export const getDeadLetterQueueName = (service: QueueService, options: DeployOptions) => {
  return `${getServiceName(service, options)}-deadletter`;
};

export const getInternalName = (service: QueueService | QueueImport, suffixName: string) => {
  return `${toKebabCase(service.name)}-${toKebabCase(suffixName)}`;
};

export const getFunctionName = (service: QueueService | QueueImport, handlerName: string, options: DeployOptions) => {
  return `${getServiceName(service, options)}-${toKebabCase(handlerName)}`;
};
