import type { DeployOptions } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { BucketService } from '@ez4/storage/library';
import { getRandomName } from '@ez4/aws-common';
import { toKebabCase } from '@ez4/utils';

export const getBucketName = async (service: BucketService, options: DeployOptions) => {
  if (service.globalName) {
    return getServiceName(service.globalName, options);
  }

  const bucketName = getServiceName(service, options);
  const randomName = await getRandomName(16);

  return `${bucketName.substring(0, 46)}-${randomName}`;
};

export const getInternalName = (service: BucketService, suffixName: string) => {
  return `${toKebabCase(service.name)}-${toKebabCase(suffixName)}`;
};

export const getFunctionName = (service: BucketService, handlerName: string, options: DeployOptions) => {
  return `${getServiceName(service, options)}-${toKebabCase(handlerName)}`;
};
