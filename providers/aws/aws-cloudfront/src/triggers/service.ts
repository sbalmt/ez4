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

export const prepareCdnServices = async (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isCdnService(service)) {
    return false;
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
      domainName: certificate.domain,
      tags: options.tags
    });
  }

  const { cache: defaultCache } = service.defaultOrigin;

  const customErrors = service.fallbacks?.map(({ code, location, ttl }) => ({
    ttl: ttl ?? defaultCache?.ttl ?? 86400,
    location,
    code
  }));

  const distributionName = getServiceName(service, options);

  const defaultOrigin = getDefaultOriginCache(state, service, options, context);
  const origins = getAdditionalOriginCache(state, service, options, context);

  const originCacheStates = [defaultOrigin.state, ...origins.map(({ state }) => state)];

  createDistribution(state, originAccessState, originPolicyState, originCacheStates, certificateState, {
    origins: origins.map(({ origin }) => origin),
    defaultOrigin: defaultOrigin.origin,
    compress: defaultCache?.compress ?? true,
    enabled: !service.disabled,
    aliases: service.aliases,
    tags: options.tags,
    distributionName,
    customErrors,
    defaultIndex,
    description
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
      contentVersion: allContentVersions.join(',')
    });
  }
};
