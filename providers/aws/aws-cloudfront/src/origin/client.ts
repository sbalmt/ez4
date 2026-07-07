import type { OriginRequestPolicyConfig } from '@aws-sdk/client-cloudfront';
import type { OperationLogLine } from '@ez4/aws-common';

import {
  GetOriginRequestPolicyCommand,
  CreateOriginRequestPolicyCommand,
  UpdateOriginRequestPolicyCommand,
  DeleteOriginRequestPolicyCommand,
  ListOriginRequestPoliciesCommand,
  OriginRequestPolicyHeaderBehavior,
  OriginRequestPolicyCookieBehavior,
  OriginRequestPolicyQueryStringBehavior,
  NoSuchOriginRequestPolicy,
  OriginRequestPolicyType
} from '@aws-sdk/client-cloudfront';

import { getCloudFrontClient } from '../utils/deploy';

export type CreateRequest = {
  policyName: string;
  description?: string;
};

export type ImportOrCreateResponse = {
  policyId: string;
};

export type UpdateRequest = CreateRequest;

export type UpdateResponse = ImportOrCreateResponse;

export const importOriginPolicy = async (logger: OperationLogLine, policyName: string): Promise<ImportOrCreateResponse | undefined> => {
  logger.update(`Importing origin policy`);

  const response = await getCloudFrontClient().send(
    new ListOriginRequestPoliciesCommand({
      Type: OriginRequestPolicyType.custom,
      MaxItems: 25
    })
  );

  const originPolicy = response?.OriginRequestPolicyList?.Items?.find(({ OriginRequestPolicy }) => {
    return OriginRequestPolicy?.OriginRequestPolicyConfig?.Name === policyName;
  });

  if (!originPolicy) {
    return undefined;
  }

  return {
    policyId: originPolicy.OriginRequestPolicy?.Id!
  };
};

export const createOriginPolicy = async (logger: OperationLogLine, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  logger.update(`Creating origin policy`);

  const response = await getCloudFrontClient().send(
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

export const updateOriginPolicy = async (logger: OperationLogLine, policyId: string, request: UpdateRequest) => {
  logger.update(`Updating origin policy`);

  const version = await getCurrentPolicyVersion(logger, policyId);

  await getCloudFrontClient().send(
    new UpdateOriginRequestPolicyCommand({
      Id: policyId,
      IfMatch: version,
      OriginRequestPolicyConfig: {
        ...upsertPolicyRequest(request)
      }
    })
  );
};

export const deleteOriginPolicy = async (logger: OperationLogLine, policyId: string) => {
  logger.update(`Deleting origin policy`);

  try {
    const version = await getCurrentPolicyVersion(logger, policyId);

    await getCloudFrontClient().send(
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

const getCurrentPolicyVersion = async (logger: OperationLogLine, policyId: string) => {
  logger.update(`Fetching origin policy`);

  const response = await getCloudFrontClient().send(
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
