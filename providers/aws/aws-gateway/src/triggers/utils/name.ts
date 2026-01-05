import type { AuthHandler, HttpHandler, HttpService, WsHandler, WsService } from '@ez4/gateway/library';
import type { DeployOptions } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

export const getInternalName = (service: HttpService | WsService, suffixName: string) => {
  return `${toKebabCase(service.name)}-${toKebabCase(suffixName)}`;
};

export const getFunctionName = (
  service: HttpService | WsService,
  functionType: AuthHandler | HttpHandler | WsHandler,
  options: DeployOptions
) => {
  const functionName = toKebabCase(functionType.name);

  return `${getServiceName(service, options)}-${functionName}`;
};
