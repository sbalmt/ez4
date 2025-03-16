import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { PolicyDocument } from '../types/policy.js';

import {
  IAMClient,
  CreatePolicyCommand,
  DeletePolicyCommand,
  CreatePolicyVersionCommand,
  DeletePolicyVersionCommand,
  TagPolicyCommand,
  UntagPolicyCommand,
  NoSuchEntityException
} from '@aws-sdk/client-iam';

import { Logger, getTagList, tryParseArn } from '@ez4/aws-common';

import { PolicyServiceName } from './types.js';

const client = new IAMClient({});

export type CreateRequest = {
  policyName: string;
  policyDocument: PolicyDocument;
  tags?: ResourceTags;
};

export type CreateResponse = {
  policyArn: Arn;
  currentVersion: string;
};

export type CreateVersionResponse = {
  versionId: string;
};

export const createPolicy = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(PolicyServiceName, request.policyName);

  const response = await client.send(
    new CreatePolicyCommand({
      PolicyName: request.policyName,
      PolicyDocument: JSON.stringify(request.policyDocument),
      Tags: getTagList({
        ...request.tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  const policy = response.Policy!;

  return {
    policyArn: policy.Arn as Arn,
    currentVersion: policy.DefaultVersionId!
  };
};

export const tagPolicy = async (policyArn: Arn, tags: ResourceTags) => {
  const policyName = tryParseArn(policyArn)?.resourceName ?? policyArn;

  Logger.logTag(PolicyServiceName, policyName);

  await client.send(
    new TagPolicyCommand({
      PolicyArn: policyArn,
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );
};

export const untagPolicy = async (policyArn: Arn, tagKeys: string[]) => {
  const policyName = tryParseArn(policyArn)?.resourceName ?? policyArn;

  Logger.logUntag(PolicyServiceName, policyName);

  await client.send(
    new UntagPolicyCommand({
      PolicyArn: policyArn,
      TagKeys: tagKeys
    })
  );
};

export const createPolicyVersion = async (policyArn: Arn, document: PolicyDocument): Promise<CreateVersionResponse> => {
  const policyName = tryParseArn(policyArn)?.resourceName ?? policyArn;

  Logger.logCreate(PolicyServiceName, `${policyName} version`);

  const response = await client.send(
    new CreatePolicyVersionCommand({
      PolicyArn: policyArn,
      PolicyDocument: JSON.stringify(document),
      SetAsDefault: true
    })
  );

  const policyVersion = response.PolicyVersion!;

  const versionId = policyVersion.VersionId!;

  return {
    versionId
  };
};

export const deletePolicyVersion = async (policyArn: Arn, versionId: string) => {
  const policyName = tryParseArn(policyArn)?.resourceName ?? policyArn;

  Logger.logDelete(PolicyServiceName, `${policyName} version ${versionId}`);

  try {
    await client.send(
      new DeletePolicyVersionCommand({
        PolicyArn: policyArn,
        VersionId: versionId
      })
    );

    return true;
  } catch (error) {
    if (!(error instanceof NoSuchEntityException)) {
      throw error;
    }

    return false;
  }
};

export const deletePolicy = async (policyArn: Arn) => {
  const policyName = tryParseArn(policyArn)?.resourceName ?? policyArn;

  Logger.logDelete(PolicyServiceName, policyName);

  try {
    await client.send(
      new DeletePolicyCommand({
        PolicyArn: policyArn
      })
    );

    return true;
  } catch (error) {
    if (!(error instanceof NoSuchEntityException)) {
      throw error;
    }

    return false;
  }
};
