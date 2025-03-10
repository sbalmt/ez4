import type { NotificationService, NotificationImport } from '@ez4/notification/library';
import type { DeployOptions } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

export const getInternalName = (service: NotificationService | NotificationImport, handlerName: string) => {
  return `${toKebabCase(service.name)}-${toKebabCase(handlerName)}`;
};

export const getFunctionName = (service: NotificationService | NotificationImport, handlerName: string, options: DeployOptions) => {
  return `${getServiceName(service, options)}-${toKebabCase(handlerName)}`;
};
