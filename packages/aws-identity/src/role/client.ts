import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { RoleDocument } from '../types/role.js';

import {
  IAMClient,
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

import { Logger, getTagList, tryParseArn } from '@ez4/aws-common';
import { RoleServiceName } from './types.js';

const client = new IAMClient({});

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

export const importRole = async (roleName: string): Promise<ImportOrCreateResponse | undefined> => {
  Logger.logImport(RoleServiceName, roleName);

  try {
    const response = await client.send(
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

export const createRole = async (request: CreateRequest): Promise<ImportOrCreateResponse> => {
  const { roleName } = request;

  Logger.logCreate(RoleServiceName, roleName);

  const response = await client.send(
    new CreateRoleCommand({
      RoleName: roleName,
      Description: request.description,
      AssumeRolePolicyDocument: JSON.stringify(request.roleDocument),
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

export const updateRole = async (roleName: string, description: string | undefined) => {
  Logger.logUpdate(RoleServiceName, roleName);

  await client.send(
    new UpdateRoleCommand({
      RoleName: roleName,
      Description: description ?? ''
    })
  );
};

export const updateAssumeRole = async (roleName: string, roleDocument: RoleDocument) => {
  Logger.logUpdate(RoleServiceName, `${roleName} assume role`);

  await client.send(
    new UpdateAssumeRolePolicyCommand({
      RoleName: roleName,
      PolicyDocument: JSON.stringify(roleDocument)
    })
  );
};

export const tagRole = async (roleName: string, tags: ResourceTags) => {
  Logger.logTag(RoleServiceName, roleName);

  await client.send(
    new TagRoleCommand({
      RoleName: roleName,
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );
};

export const untagRole = async (roleName: string, tagsKeys: string[]) => {
  Logger.logUntag(RoleServiceName, roleName);

  await client.send(
    new UntagRoleCommand({
      RoleName: roleName,
      TagKeys: tagsKeys
    })
  );
};

export const attachPolicy = async (roleName: string, policyArn: string) => {
  const resource = tryParseArn(policyArn)?.resourceName ?? policyArn;

  Logger.logAttach(RoleServiceName, roleName, resource);

  await client.send(
    new AttachRolePolicyCommand({
      RoleName: roleName,
      PolicyArn: policyArn
    })
  );
};

export const detachPolicy = async (roleName: string, policyArn: string) => {
  const resource = tryParseArn(policyArn)?.resourceName ?? policyArn;

  try {
    Logger.logDetach(RoleServiceName, roleName, resource);

    await client.send(
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

export const deleteRole = async (roleName: string) => {
  Logger.logDelete(RoleServiceName, roleName);

  try {
    await client.send(
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
