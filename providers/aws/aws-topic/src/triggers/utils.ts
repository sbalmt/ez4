import type { TopicService, TopicImport } from '@ez4/topic/library';
import type { DeployOptions } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

export const getInternalName = (service: TopicService | TopicImport, suffixName: string) => {
  return `${toKebabCase(service.name)}-${toKebabCase(suffixName)}`;
};

export const getFunctionName = (service: TopicService | TopicImport, handlerName: string, options: DeployOptions) => {
  return `${getServiceName(service, options)}-${toKebabCase(handlerName)}`;
};
