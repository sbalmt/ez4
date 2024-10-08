import type { PrepareResourceEvent, ConnectResourceEvent } from '@ez4/project/library';

import { isCdnBucketOrigin, isCdnService } from '@ez4/distribution/library';
import { getServiceName } from '@ez4/project/library';
import { getBucketState } from '@ez4/aws-bucket';

import { createOriginAccess } from '../access/service.js';
import { createDistribution } from '../distribution/service.js';
import { getDistributionState } from '../distribution/utils.js';
import { createInvalidation } from '../invalidation/service.js';
import { getAdditionalOrigins, getDefaultOrigin } from './origin.js';
import { getOriginAccessName, getContentVersion } from './utils.js';
import { connectOriginBucket } from './bucket.js';

export const prepareCdnServices = async (event: PrepareResourceEvent) => {
  const { state, service, options } = event;

  if (!isCdnService(service)) {
    return;
  }

  const { description, defaultIndex, defaultOrigin } = service;

  const originAccessState = createOriginAccess(state, {
    accessName: getOriginAccessName(service, options),
    description
  });

  const { cache: defaultCache } = defaultOrigin;

  const customErrors = service.fallbacks?.map(({ code, location, ttl }) => ({
    ttl: ttl ?? defaultCache?.ttl ?? 86400,
    location,
    code
  }));

  createDistribution(state, originAccessState, {
    distributionName: getServiceName(service, options),
    defaultOrigin: await getDefaultOrigin(state, service, options),
    origins: await getAdditionalOrigins(state, service, options),
    compress: defaultCache?.compress ?? true,
    enabled: !service.disabled,
    aliases: service.aliases,
    defaultIndex,
    customErrors,
    description
  });
};

export const connectCdnServices = async (event: ConnectResourceEvent) => {
  const { state, service, options } = event;

  if (!isCdnService(service)) {
    return;
  }

  const distributionName = getServiceName(service, options);
  const distributionState = getDistributionState(state, distributionName);

  const contentVersions: string[] = [];

  const allOrigins = service.origins
    ? [service.defaultOrigin, ...service.origins]
    : [service.defaultOrigin];

  for (const origin of allOrigins) {
    if (!isCdnBucketOrigin(origin)) {
      continue;
    }

    const bucketName = getServiceName(origin.bucket, options);
    const bucketState = getBucketState(state, bucketName);

    connectOriginBucket(state, service, bucketState, options);

    const { localPath } = bucketState.parameters;

    if (localPath) {
      const version = await getContentVersion(localPath);

      contentVersions.push(version);
    }
  }

  if (contentVersions.length > 0) {
    createInvalidation(state, distributionState, {
      contentVersion: contentVersions.join(',')
    });
  }
};
