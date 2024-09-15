import type { CachePolicyConfig } from '@aws-sdk/client-cloudfront';

import { Logger } from '@ez4/aws-common';

import {
  CreateCachePolicyCommand,
  UpdateCachePolicyCommand,
  DeleteCachePolicyCommand,
  CloudFrontClient,
  CachePolicyHeaderBehavior,
  CachePolicyCookieBehavior,
  CachePolicyQueryStringBehavior
} from '@aws-sdk/client-cloudfront';

import { PolicyServiceName } from './types.js';

const client = new CloudFrontClient({});

export type CreateRequest = {
  policyName: string;
  description?: string;
  compress?: boolean;
  defaultTTL: number;
  minTTL: number;
  maxTTL: number;
};

export type CreateResponse = {
  policyId: string;
  version: string;
};

export type UpdateRequest = CreateRequest;

export type UpdateResponse = CreateResponse;

export const createPolicy = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(PolicyServiceName, request.policyName);

  const response = await client.send(
    new CreateCachePolicyCommand({
      CachePolicyConfig: {
        ...upsertPolicyRequest(request)
      }
    })
  );

  return {
    policyId: response.CachePolicy?.Id!,
    version: response.ETag!
  };
};

export const updatePolicy = async (
  policyId: string,
  version: string,
  request: UpdateRequest
): Promise<UpdateResponse> => {
  Logger.logUpdate(PolicyServiceName, request.policyName);

  const response = await client.send(
    new UpdateCachePolicyCommand({
      Id: policyId,
      IfMatch: version,
      CachePolicyConfig: {
        ...upsertPolicyRequest(request)
      }
    })
  );

  return {
    policyId: response.CachePolicy?.Id!,
    version: response.ETag!
  };
};

export const deletePolicy = async (policyId: string, version: string) => {
  Logger.logDelete(PolicyServiceName, policyId);

  await client.send(
    new DeleteCachePolicyCommand({
      Id: policyId,
      IfMatch: version
    })
  );
};

const upsertPolicyRequest = (request: CreateRequest | UpdateRequest): CachePolicyConfig => {
  const { policyName, description, defaultTTL, minTTL, maxTTL, compress } = request;

  return {
    Name: policyName,
    Comment: description,
    DefaultTTL: defaultTTL,
    MinTTL: minTTL,
    MaxTTL: maxTTL,
    ParametersInCacheKeyAndForwardedToOrigin: {
      EnableAcceptEncodingGzip: !!compress,
      EnableAcceptEncodingBrotli: !!compress,
      HeadersConfig: {
        HeaderBehavior: CachePolicyHeaderBehavior.none
      },
      CookiesConfig: {
        CookieBehavior: CachePolicyCookieBehavior.none
      },
      QueryStringsConfig: {
        QueryStringBehavior: CachePolicyQueryStringBehavior.none
      }
    }
  };
};
