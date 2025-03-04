import type { DeployOptions } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { BucketService } from '@ez4/storage/library';
import { getRandomName } from '@ez4/aws-common';
import { toKebabCase } from '@ez4/utils';

export const getBucketName = async (service: BucketService, options: DeployOptions) => {
  if (service.globalName) {
    return service.globalName;
  }

  const bucketName = getServiceName(service, options).substring(0, 46);
  const randomName = await getRandomName(16);

  return `${bucketName}-${randomName}`;
};

export const getFunctionName = (
  service: BucketService,
  handlerName: string,
  options: DeployOptions
) => {
  return `${getServiceName(service, options)}-${toKebabCase(handlerName)}`;
};
