import type { HttpAuthorizer, HttpHandler, HttpService } from '@ez4/gateway/library';
import type { DeployOptions } from '@ez4/project/library';

import { toKebabCase } from '@ez4/utils';

export const getFunctionName = (
  service: HttpService,
  functionType: HttpHandler | HttpAuthorizer,
  options: DeployOptions
) => {
  const resourcePrefix = toKebabCase(options.resourcePrefix);
  const projectName = toKebabCase(options.projectName);
  const serviceName = toKebabCase(service.name);
  const functionName = toKebabCase(functionType.name);

  return `${resourcePrefix}-${projectName}-${serviceName}-${functionName}`;
};
