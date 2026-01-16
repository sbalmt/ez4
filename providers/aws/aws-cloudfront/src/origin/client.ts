import type { OriginRequestPolicyConfig } from '@aws-sdk/client-cloudfront';
import type { Logger } from '@ez4/aws-common';

import {
  CloudFrontClient,
  CreateOriginRequestPolicyCommand,
  OriginRequestPolicyCookieBehavior,
  OriginRequestPolicyHeaderBehavior,
  OriginRequestPolicyQueryStringBehavior,
  UpdateOriginRequestPolicyCommand,
  DeleteOriginRequestPolicyCommand,
  GetOriginRequestPolicyCommand,
  NoSuchOriginRequestPolicy
} from '@aws-sdk/client-cloudfront';

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

export const createOriginPolicy = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating origin policy`);

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

export const updateOriginPolicy = async (logger: Logger.OperationLogger, policyId: string, request: UpdateRequest) => {
  logger.update(`Updating origin policy`);

  const version = await getCurrentPolicyVersion(logger, policyId);

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

export const deleteOriginPolicy = async (logger: Logger.OperationLogger, policyId: string) => {
  logger.update(`Deleting origin policy`);

  try {
    const version = await getCurrentPolicyVersion(logger, policyId);

    await client.send(
      new DeleteOriginRequestPolicyCommand({
        Id: policyId,
        IfMatch: version
      })
    );

    return true;
  } catch (error) {
    if (!(error instanceof NoSuchOriginRequestPolicy)) {
      throw error;
    }

    return false;
  }
};

const getCurrentPolicyVersion = async (logger: Logger.OperationLogger, policyId: string) => {
  logger.update(`Fetching origin policy`);

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
