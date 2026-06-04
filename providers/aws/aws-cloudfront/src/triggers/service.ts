import type { PrepareResourceEvent, ConnectResourceEvent } from '@ez4/project/library';

import { isCdnBucketOrigin, isCdnService } from '@ez4/distribution/library';
import { getServiceName } from '@ez4/project/library';
import { getBucketState } from '@ez4/aws-bucket';

import { createOriginPolicy } from '../origin/service';
import { createOriginAccess } from '../access/service';
import { createCertificate } from '../certificate/service';
import { createDistribution } from '../distribution/service';
import { getDistributionState } from '../distribution/utils';
import { createInvalidation } from '../invalidation/service';
import { getAdditionalOriginCache, getDefaultOriginCache } from './cache';
import { getOriginAccessName, getContentVersion, getOriginPolicyName } from './utils';
import { connectOriginBucket } from './bucket';
import { prepareRewrites } from './rewrite';

export const prepareCdnServices = (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isCdnService(service)) {
    return false;
  }

  const { description, fallbacks, certificate, defaultIndex } = service;
  const { cache: defaultCache } = service.defaultOrigin;

  const defaultOrigin = getDefaultOriginCache(state, service, options, context);
  const otherOrigins = getAdditionalOriginCache(state, service, options, context);

  createDistribution(state, {
    originCacheStates: [defaultOrigin.state, ...otherOrigins.map(({ state }) => state)],
    rewriteFunctionState: prepareRewrites(state, service, options),
    distributionName: getServiceName(service, options),
    origins: otherOrigins.map(({ origin }) => origin),
    defaultOrigin: defaultOrigin.origin,
    compress: defaultCache?.compress ?? true,
    enabled: !service.disabled,
    aliases: service.aliases,
    tags: options.tags,
    description,
    defaultIndex,
    originAccessState: createOriginAccess(state, {
      accessName: getOriginAccessName(service, options),
      description
    }),
    originPolicyState: createOriginPolicy(state, {
      policyName: getOriginPolicyName(service, options),
      description
    }),
    certificateState:
      certificate &&
      createCertificate(state, {
        domainName: certificate.domain,
        tags: options.tags
      }),
    customErrors: fallbacks?.map(({ code, location, ttl }) => ({
      ttl: ttl ?? defaultCache?.ttl ?? 86400,
      location,
      code
    }))
  });

  return true;
};

export const connectCdnServices = async (event: ConnectResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isCdnService(service)) {
    return;
  }

  const distributionName = getServiceName(service, options);
  const distributionState = getDistributionState(state, distributionName);

  const allContentVersions: string[] = [];

  const allOrigins = service.origins ? [service.defaultOrigin, ...service.origins] : [service.defaultOrigin];

  for (const origin of allOrigins) {
    if (!isCdnBucketOrigin(origin)) {
      continue;
    }

    const bucketState = getBucketState(context, origin.bucket, options);

    connectOriginBucket(state, service, bucketState, options);

    const { localPath } = bucketState.parameters;

    if (localPath) {
      const contentHash = await getContentVersion(localPath);

      allContentVersions.push(contentHash);
    }
  }

  if (allContentVersions.length > 0) {
    createInvalidation(state, distributionState, {
      contentVersion: allContentVersions.join(','),
      invalidations: service.invalidations
    });
  }
};
