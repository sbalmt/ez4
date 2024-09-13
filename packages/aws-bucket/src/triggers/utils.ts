import type { BucketService } from '@ez4/storage/library';
import type { DeployOptions } from '@ez4/project/library';

import { toKebabCase } from '@ez4/utils';

export const getBucketName = (service: BucketService, options: DeployOptions) => {
  const resourcePrefix = toKebabCase(options.resourcePrefix);
  const projectName = toKebabCase(options.projectName);
  const bucketName = toKebabCase(service.name);

  return `${resourcePrefix}-${projectName}-${bucketName}`;
};
