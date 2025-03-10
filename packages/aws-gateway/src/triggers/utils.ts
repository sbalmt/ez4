import type { HttpAuthorizer, HttpHandler, HttpService } from '@ez4/gateway/library';
import type { DeployOptions } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

export const getInternalName = (service: HttpService, handlerName: string) => {
  return `${toKebabCase(service.name)}-${toKebabCase(handlerName)}`;
};

export const getFunctionName = (service: HttpService, functionType: HttpHandler | HttpAuthorizer, options: DeployOptions) => {
  const functionName = toKebabCase(functionType.name);

  return `${getServiceName(service, options)}-${functionName}`;
};
