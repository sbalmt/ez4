import type { DeployOptions } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { BucketService } from '@ez4/storage/library';
import { getRandomName } from '@ez4/aws-common';

export const getNewBucketName = async (service: BucketService, options: DeployOptions) => {
  const bucketName = getServiceName(service, options).substring(0, 46);
  const randomName = await getRandomName(16);

  return `${bucketName}-${randomName}`;
};
