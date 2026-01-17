import type { Arn, Logger, ResourceTags } from '@ez4/aws-common';
import type { PolicyDocument } from '../types/policy';

import {
  IAMClient,
  CreatePolicyCommand,
  DeletePolicyCommand,
  ListPolicyVersionsCommand,
  CreatePolicyVersionCommand,
  DeletePolicyVersionCommand,
  TagPolicyCommand,
  UntagPolicyCommand,
  NoSuchEntityException
} from '@aws-sdk/client-iam';

import { getTagList } from '@ez4/aws-common';

import { getPolicyArn } from '../utils/policy';

const client = new IAMClient({});

export type CreateRequest = {
  policyName: string;
  policyDocument: PolicyDocument;
  tags?: ResourceTags;
};

export type ImportOrCreateResponse = {
  versionHistory: string[];
  currentVersion: string;
  policyArn: Arn;
};

export type CreateVersionResponse = {
  versionId: string;
};

export const importPolicy = async (logger: Logger.OperationLogger, policyName: string): Promise<ImportOrCreateResponse | undefined> => {
  logger.update(`Importing IAM policy`);

  const policyArn = await getPolicyArn(policyName);

  try {
    const response = await client.send(
      new ListPolicyVersionsCommand({
        PolicyArn: policyArn
      })
    );

    const versionHistory = [];

    for (const { VersionId, IsDefaultVersion } of response.Versions!) {
      if (IsDefaultVersion) {
        versionHistory.unshift(VersionId!);
      } else {
        versionHistory.push(VersionId!);
      }
    }

    const currentVersion = versionHistory.shift();

    if (!currentVersion) {
      return undefined;
    }

    return {
      currentVersion,
      versionHistory,
      policyArn
    };
  } catch (error) {
    if (!(error instanceof NoSuchEntityException)) {
      throw error;
    }

    return undefined;
  }
};

export const createPolicy = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  logger.update(`Creating IAM policy`);

  const { policyName, policyDocument } = request;

  const response = await client.send(
    new CreatePolicyCommand({
      PolicyName: policyName,
      PolicyDocument: JSON.stringify(policyDocument),
      Tags: getTagList({
        ...request.tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  const policy = response.Policy!;

  return {
    versionHistory: [],
    currentVersion: policy.DefaultVersionId!,
    policyArn: policy.Arn as Arn
  };
};

export const tagPolicy = async (logger: Logger.OperationLogger, policyArn: Arn, tags: ResourceTags) => {
  logger.update(`Tag IAM policy`);

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

export const untagPolicy = async (logger: Logger.OperationLogger, policyArn: Arn, tagKeys: string[]) => {
  logger.update(`Untag IAM policy`);

  await client.send(
    new UntagPolicyCommand({
      PolicyArn: policyArn,
      TagKeys: tagKeys
    })
  );
};

export const createPolicyVersion = async (
  logger: Logger.OperationLogger,
  policyArn: Arn,
  document: PolicyDocument
): Promise<CreateVersionResponse> => {
  logger.update(`Creating policy version`);

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

export const deletePolicyVersion = async (logger: Logger.OperationLogger, policyArn: Arn, versionId: string) => {
  logger.update(`Deleting policy version`);

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

export const deletePolicy = async (logger: Logger.OperationLogger, policyArn: Arn) => {
  logger.update(`Deleting IAM policy`);

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
