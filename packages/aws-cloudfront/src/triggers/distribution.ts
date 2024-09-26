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

  const originAccessState = createOriginAccess(state, {
    accessName: getOriginAccessName(service, options),
    description
  });

  const defaultTTL = service.cacheTTL ?? 86400;

  const cachePolicyState = createCachePolicy(state, {
    policyName: getCachePolicyName(service, options),
    maxTTL: service.maxCacheTTL ?? 31536000,
    minTTL: service.minCacheTTL ?? 1,
    defaultTTL,
    description,
    compress
  });

  const customErrors = service.fallbacks?.map(({ code, path, ttl }) => ({
    ttl: ttl ?? defaultTTL,
    code,
    path
  }));

  createDistribution(state, originAccessState, cachePolicyState, {
    distributionName: getServiceName(service, options),
    defaultIndex: service.defaultIndex,
    enabled: !service.disabled,
    aliases: service.aliases,
    customErrors,
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
