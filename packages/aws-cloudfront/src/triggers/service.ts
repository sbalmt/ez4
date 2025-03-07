import type { PrepareResourceEvent, ConnectResourceEvent } from '@ez4/project/library';

import { isCdnBucketOrigin, isCdnService } from '@ez4/distribution/library';
import { getServiceName } from '@ez4/project/library';
import { getBucketState } from '@ez4/aws-bucket';

import { createOriginPolicy } from '../origin/service.js';
import { createOriginAccess } from '../access/service.js';
import { createCertificate } from '../certificate/service.js';
import { createDistribution } from '../distribution/service.js';
import { getDistributionState } from '../distribution/utils.js';
import { createInvalidation } from '../invalidation/service.js';
import { getAdditionalOriginCache, getDefaultOriginCache } from './cache.js';
import { getOriginAccessName, getContentVersion, getOriginPolicyName } from './utils.js';
import { connectOriginBucket } from './bucket.js';

export const prepareCdnServices = async (event: PrepareResourceEvent) => {
  const { state, service, options } = event;

  if (!isCdnService(service)) {
    return;
  }

  const { description, certificate, defaultIndex } = service;

  const originPolicyState = createOriginPolicy(state, {
    policyName: getOriginPolicyName(service, options),
    description
  });

  const originAccessState = createOriginAccess(state, {
    accessName: getOriginAccessName(service, options),
    description
  });

  let certificateState;

  if (certificate) {
    certificateState = createCertificate(state, {
      domainName: certificate.domain
    });
  }

  const { cache: defaultCache } = service.defaultOrigin;

  const customErrors = service.fallbacks?.map(({ code, location, ttl }) => ({
    ttl: ttl ?? defaultCache?.ttl ?? 86400,
    location,
    code
  }));

  const distributionName = getServiceName(service, options);

  const defaultOrigin = await getDefaultOriginCache(state, service, options);
  const origins = await getAdditionalOriginCache(state, service, options);

  createDistribution(state, originAccessState, originPolicyState, certificateState, {
    compress: defaultCache?.compress ?? true,
    enabled: !service.disabled,
    aliases: service.aliases,
    distributionName,
    description,
    customErrors,
    defaultOrigin,
    defaultIndex,
    origins
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

    const bucketState = getBucketState(state, origin.bucket);

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
