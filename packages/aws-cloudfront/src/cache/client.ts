import type { CachePolicyConfig } from '@aws-sdk/client-cloudfront';

import { Logger } from '@ez4/aws-common';

import {
  CloudFrontClient,
  GetCachePolicyCommand,
  CreateCachePolicyCommand,
  UpdateCachePolicyCommand,
  DeleteCachePolicyCommand,
  CachePolicyHeaderBehavior,
  CachePolicyCookieBehavior,
  CachePolicyQueryStringBehavior,
  NoSuchCachePolicy
} from '@aws-sdk/client-cloudfront';

import { CacheServiceName } from './types.js';

const client = new CloudFrontClient({});

export type CacheKeys = {
  headers?: string[];
  cookies?: string[];
  queries?: string[];
};

export type CreateRequest = {
  policyName: string;
  description?: string;
  cacheKeys: CacheKeys;
  compress?: boolean;
  defaultTTL: number;
  minTTL: number;
  maxTTL: number;
};

export type CreateResponse = {
  policyId: string;
};

export type UpdateRequest = CreateRequest;

export type UpdateResponse = CreateResponse;

export const createCachePolicy = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(CacheServiceName, request.policyName);

  const response = await client.send(
    new CreateCachePolicyCommand({
      CachePolicyConfig: {
        ...upsertPolicyRequest(request)
      }
    })
  );

  const policyId = response.CachePolicy?.Id!;

  return {
    policyId
  };
};

export const updateCachePolicy = async (policyId: string, request: UpdateRequest) => {
  Logger.logUpdate(CacheServiceName, request.policyName);

  const version = await getCurrentPolicyVersion(policyId);

  await client.send(
    new UpdateCachePolicyCommand({
      Id: policyId,
      IfMatch: version,
      CachePolicyConfig: {
        ...upsertPolicyRequest(request)
      }
    })
  );
};

export const deleteCachePolicy = async (policyId: string) => {
  Logger.logDelete(CacheServiceName, policyId);

  try {
    const version = await getCurrentPolicyVersion(policyId);

    await client.send(
      new DeleteCachePolicyCommand({
        Id: policyId,
        IfMatch: version
      })
    );

    return true;
  } catch (error) {
    if (!(error instanceof NoSuchCachePolicy)) {
      throw error;
    }

    return false;
  }
};

const getCurrentPolicyVersion = async (policyId: string) => {
  const response = await client.send(
    new GetCachePolicyCommand({
      Id: policyId
    })
  );

  return response.ETag!;
};

const upsertPolicyRequest = (request: CreateRequest | UpdateRequest): CachePolicyConfig => {
  const { policyName, description, cacheKeys, defaultTTL, minTTL, maxTTL, compress } = request;

  const { headers, cookies, queries } = cacheKeys;

  const hasHeaderKeys = !!headers?.length;
  const hasCookieKeys = !!cookies?.length;
  const hasQueryKeys = !!queries?.length;

  return {
    Name: policyName,
    Comment: description,
    DefaultTTL: defaultTTL,
    MinTTL: minTTL,
    MaxTTL: maxTTL,
    ParametersInCacheKeyAndForwardedToOrigin: {
      EnableAcceptEncodingGzip: !!compress,
      EnableAcceptEncodingBrotli: !!compress,
      HeadersConfig: hasHeaderKeys
        ? {
            HeaderBehavior: CachePolicyHeaderBehavior.whitelist,
            Headers: {
              Quantity: headers.length,
              Items: headers
            }
          }
        : {
            HeaderBehavior: CachePolicyHeaderBehavior.none
          },
      CookiesConfig: hasCookieKeys
        ? {
            CookieBehavior: CachePolicyCookieBehavior.whitelist,
            Cookies: {
              Quantity: cookies.length,
              Items: cookies
            }
          }
        : {
            CookieBehavior: CachePolicyCookieBehavior.none
          },
      QueryStringsConfig: hasQueryKeys
        ? {
            QueryStringBehavior: CachePolicyQueryStringBehavior.whitelist,
            QueryStrings: {
              Quantity: queries.length,
              Items: queries
            }
          }
        : {
            QueryStringBehavior: CachePolicyQueryStringBehavior.all
          }
    }
  };
};
