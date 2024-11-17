import type { OriginRequestPolicyConfig } from '@aws-sdk/client-cloudfront';

import { Logger } from '@ez4/aws-common';

import {
  CloudFrontClient,
  CreateOriginRequestPolicyCommand,
  OriginRequestPolicyCookieBehavior,
  OriginRequestPolicyHeaderBehavior,
  OriginRequestPolicyQueryStringBehavior,
  UpdateOriginRequestPolicyCommand,
  DeleteOriginRequestPolicyCommand,
  GetOriginRequestPolicyCommand
} from '@aws-sdk/client-cloudfront';

import { OriginServiceName } from './types.js';

const client = new CloudFrontClient({});

export type CreateRequest = {
  policyName: string;
  description?: string;
};

export type CreateResponse = {
  policyId: string;
};

export type UpdateRequest = CreateRequest;

export type UpdateResponse = CreateResponse;

export const createOriginPolicy = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(OriginServiceName, request.policyName);

  const response = await client.send(
    new CreateOriginRequestPolicyCommand({
      OriginRequestPolicyConfig: {
        ...upsertPolicyRequest(request)
      }
    })
  );

  const policyId = response.OriginRequestPolicy?.Id!;

  return {
    policyId
  };
};

export const updateOriginPolicy = async (policyId: string, request: UpdateRequest) => {
  Logger.logUpdate(OriginServiceName, request.policyName);

  const version = await getCurrentPolicyVersion(policyId);

  await client.send(
    new UpdateOriginRequestPolicyCommand({
      Id: policyId,
      IfMatch: version,
      OriginRequestPolicyConfig: {
        ...upsertPolicyRequest(request)
      }
    })
  );
};

export const deleteOriginPolicy = async (policyId: string) => {
  Logger.logDelete(OriginServiceName, policyId);

  const version = await getCurrentPolicyVersion(policyId);

  await client.send(
    new DeleteOriginRequestPolicyCommand({
      Id: policyId,
      IfMatch: version
    })
  );
};

const getCurrentPolicyVersion = async (policyId: string) => {
  const response = await client.send(
    new GetOriginRequestPolicyCommand({
      Id: policyId
    })
  );

  return response.ETag!;
};

const upsertPolicyRequest = (request: CreateRequest | UpdateRequest): OriginRequestPolicyConfig => {
  const { policyName, description } = request;

  return {
    Name: policyName,
    Comment: description,
    QueryStringsConfig: {
      QueryStringBehavior: OriginRequestPolicyQueryStringBehavior.all
    },
    CookiesConfig: {
      CookieBehavior: OriginRequestPolicyCookieBehavior.all
    },
    HeadersConfig: {
      HeaderBehavior: OriginRequestPolicyHeaderBehavior.allExcept,
      Headers: {
        Quantity: 1,
        Items: ['host']
      }
    }
  };
};
