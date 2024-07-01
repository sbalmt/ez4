import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { PolicyDocument } from '../types/policy.js';

import {
  CreatePolicyCommand,
  CreatePolicyVersionCommand,
  DeletePolicyCommand,
  DeletePolicyVersionCommand,
  IAMClient,
  TagPolicyCommand,
  UntagPolicyCommand
} from '@aws-sdk/client-iam';

import { Logger, getTagList } from '@ez4/aws-common';

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

  return {
    policyArn: response.Policy!.Arn as Arn,
    currentVersion: response.Policy!.DefaultVersionId!
  };
};

export const tagPolicy = async (policyArn: Arn, tags: ResourceTags) => {
  Logger.logTag(PolicyServiceName, policyArn);

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
  Logger.logUntag(PolicyServiceName, policyArn);

  await client.send(
    new UntagPolicyCommand({
      PolicyArn: policyArn,
      TagKeys: tagKeys
    })
  );
};

export const createPolicyVersion = async (
  policyArn: Arn,
  document: PolicyDocument
): Promise<CreateVersionResponse> => {
  Logger.logCreate(PolicyServiceName, `${policyArn} version`);

  const response = await client.send(
    new CreatePolicyVersionCommand({
      PolicyArn: policyArn,
      PolicyDocument: JSON.stringify(document),
      SetAsDefault: true
    })
  );

  return {
    versionId: response.PolicyVersion!.VersionId!
  };
};

export const deletePolicyVersion = async (policyArn: Arn, versionId: string) => {
  Logger.logDelete(PolicyServiceName, `${policyArn} version ${versionId}`);

  await client.send(
    new DeletePolicyVersionCommand({
      PolicyArn: policyArn,
      VersionId: versionId
    })
  );
};

export const deletePolicy = async (policyArn: Arn) => {
  Logger.logDelete(PolicyServiceName, policyArn);

  await client.send(
    new DeletePolicyCommand({
      PolicyArn: policyArn
    })
  );
};
