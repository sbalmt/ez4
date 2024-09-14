import type { ServiceResourceEvent } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { getBucketDomain, getBucketId } from '@ez4/aws-bucket';
import { isCdnService } from '@ez4/distribution/library';

import { createDistribution } from '../distribution/service.js';

export const prepareCdnServices = async (event: ServiceResourceEvent) => {
  const { state, service, options } = event;

  if (!isCdnService(service)) {
    return;
  }

  const { description, defaultIndex, defaultOrigin, compress, disabled } = service;

  const bucketName = getServiceName(defaultOrigin.bucket, options);

  const bucketEntryId = getBucketId(bucketName);

  const bucketDomain = await getBucketDomain(bucketName);

  const distribution = createDistribution(state, {
    distributionName: getServiceName(service, options),
    enabled: !disabled,
    defaultOrigin: {
      id: 'default',
      domainName: bucketDomain
    },
    defaultIndex,
    description,
    compress
  });

  distribution.dependencies.push(bucketEntryId);
};
