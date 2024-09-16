import type { PrepareResourceEvent, ConnectResourceEvent } from '@ez4/project/library';

import { getBucketDomain, getBucketState } from '@ez4/aws-bucket';

import { isCdnService } from '@ez4/distribution/library';
import { getServiceName } from '@ez4/project/library';

import { createCachePolicy } from '../policy/service.js';
import { createOriginAccess } from '../access/service.js';
import { createDistribution } from '../distribution/service.js';
import { createInvalidation } from '../invalidation/service.js';
import { getCachePolicyName, getOriginAccessName, getContentVersion } from './utils.js';
import { connectOriginBucket } from './bucket.js';

export const prepareCdnServices = async (event: PrepareResourceEvent) => {
  const { state, service, options } = event;

  if (!isCdnService(service)) {
    return;
  }

  const { defaultOrigin, description, compress = true } = service;

  const bucketName = getServiceName(defaultOrigin.bucket, options);

  const accessState = createOriginAccess(state, {
    accessName: getOriginAccessName(service, options),
    description
  });

  const policyState = createCachePolicy(state, {
    policyName: getCachePolicyName(service, options),
    defaultTTL: service.cacheTTL ?? 86400,
    maxTTL: service.maxCacheTTL ?? 31536000,
    minTTL: service.minCacheTTL ?? 1,
    description,
    compress
  });

  createDistribution(state, accessState, policyState, {
    distributionName: getServiceName(service, options),
    defaultIndex: service.defaultIndex,
    enabled: !service.disabled,
    description,
    compress,
    defaultOrigin: {
      id: 'default',
      domain: await getBucketDomain(bucketName),
      path: defaultOrigin.path
    }
  });
};

export const connectCdnServices = async (event: ConnectResourceEvent) => {
  const { state, service, options } = event;

  if (!isCdnService(service)) {
    return;
  }

  const defaultOrigin = service.defaultOrigin;

  const bucketName = getServiceName(defaultOrigin.bucket, options);
  const bucketState = getBucketState(state, bucketName);

  const distributionState = connectOriginBucket(state, service, bucketState, options);

  const localPath = bucketState.parameters.localPath;

  if (localPath) {
    createInvalidation(state, distributionState, {
      contentVersion: await getContentVersion(localPath)
    });
  }
};
