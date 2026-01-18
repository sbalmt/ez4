import type { Arn, Logger, ResourceTags } from '@ez4/aws-common';
import type { RoleDocument } from '../types/role';

import {
  GetRoleCommand,
  CreateRoleCommand,
  UpdateRoleCommand,
  DeleteRoleCommand,
  UpdateAssumeRolePolicyCommand,
  AttachRolePolicyCommand,
  DetachRolePolicyCommand,
  TagRoleCommand,
  UntagRoleCommand,
  NoSuchEntityException
} from '@aws-sdk/client-iam';

import { getTagList } from '@ez4/aws-common';
import { getIAMClient } from '../utils/deploy';

export type CreateRequest = {
  roleName: string;
  roleDocument: RoleDocument;
  description?: string;
  tags?: ResourceTags;
};

export type ImportOrCreateResponse = {
  roleName: string;
  roleArn: Arn;
};

export const importRole = async (logger: Logger.OperationLogger, roleName: string): Promise<ImportOrCreateResponse | undefined> => {
  logger.update(`Importing IAM role`);

  try {
    const response = await getIAMClient().send(
      new GetRoleCommand({
        RoleName: roleName
      })
    );

    const roleArn = response.Role!.Arn as Arn;

    return {
      roleName,
      roleArn
    };
  } catch (error) {
    if (!(error instanceof NoSuchEntityException)) {
      throw error;
    }

    return undefined;
  }
};

export const createRole = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  logger.update(`Creating IAM role`);

  const { roleName, description, roleDocument } = request;

  const response = await getIAMClient().send(
    new CreateRoleCommand({
      RoleName: roleName,
      Description: description,
      AssumeRolePolicyDocument: JSON.stringify(roleDocument),
      Tags: getTagList({
        ...request.tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  const roleArn = response.Role!.Arn as Arn;

  return {
    roleName,
    roleArn
  };
};

export const updateRole = async (logger: Logger.OperationLogger, roleName: string, description: string | undefined) => {
  logger.update(`Updating IAM role`);

  await getIAMClient().send(
    new UpdateRoleCommand({
      RoleName: roleName,
      Description: description ?? ''
    })
  );
};

export const updateAssumeRole = async (logger: Logger.OperationLogger, roleName: string, roleDocument: RoleDocument) => {
  logger.update(`Updating IAM assume role`);

  await getIAMClient().send(
    new UpdateAssumeRolePolicyCommand({
      RoleName: roleName,
      PolicyDocument: JSON.stringify(roleDocument)
    })
  );
};

export const tagRole = async (logger: Logger.OperationLogger, roleName: string, tags: ResourceTags) => {
  logger.update(`Tag IAM role`);

  await getIAMClient().send(
    new TagRoleCommand({
      RoleName: roleName,
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );
};

export const untagRole = async (logger: Logger.OperationLogger, roleName: string, tagsKeys: string[]) => {
  logger.update(`Untag IAM role`);

  await getIAMClient().send(
    new UntagRoleCommand({
      RoleName: roleName,
      TagKeys: tagsKeys
    })
  );
};

export const attachPolicy = async (logger: Logger.OperationLogger, roleName: string, policyArn: string) => {
  logger.update(`Attaching IAM policy`);

  await getIAMClient().send(
    new AttachRolePolicyCommand({
      RoleName: roleName,
      PolicyArn: policyArn
    })
  );
};

export const detachPolicy = async (logger: Logger.OperationLogger, roleName: string, policyArn: string) => {
  logger.update(`Detaching IAM policy`);

  try {
    await getIAMClient().send(
      new DetachRolePolicyCommand({
        RoleName: roleName,
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

export const deleteRole = async (logger: Logger.OperationLogger, roleName: string) => {
  logger.update(`Deleting IAM role`);

  try {
    await getIAMClient().send(
      new DeleteRoleCommand({
        RoleName: roleName
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
