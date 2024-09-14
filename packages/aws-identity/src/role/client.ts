import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { RoleDocument } from '../types/role.js';

import {
  AttachRolePolicyCommand,
  CreateRoleCommand,
  DeleteRoleCommand,
  DetachRolePolicyCommand,
  IAMClient,
  TagRoleCommand,
  UntagRoleCommand,
  UpdateAssumeRolePolicyCommand,
  UpdateRoleCommand
} from '@aws-sdk/client-iam';

import { Logger, getTagList } from '@ez4/aws-common';
import { RoleServiceName } from './types.js';

const client = new IAMClient({});

export type CreateRequest = {
  roleName: string;
  roleDocument: RoleDocument;
  description?: string;
  tags?: ResourceTags;
};

export type CreateResponse = {
  roleArn: Arn;
  roleName: string;
};

export const createRole = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(RoleServiceName, request.roleName);

  const response = await client.send(
    new CreateRoleCommand({
      RoleName: request.roleName,
      Description: request.description,
      AssumeRolePolicyDocument: JSON.stringify(request.roleDocument),
      Tags: getTagList({
        ...request.tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  const role = response.Role!;

  return {
    roleName: role.RoleName!,
    roleArn: role.Arn as Arn
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
  Logger.logAttach(RoleServiceName, roleName, policyArn);

  await client.send(
    new AttachRolePolicyCommand({
      RoleName: roleName,
      PolicyArn: policyArn
    })
  );
};

export const detachPolicy = async (roleName: string, policyArn: string) => {
  Logger.logDetach(RoleServiceName, roleName, policyArn);

  await client.send(
    new DetachRolePolicyCommand({
      RoleName: roleName,
      PolicyArn: policyArn
    })
  );
};

export const deleteRole = async (roleName: string) => {
  Logger.logDelete(RoleServiceName, roleName);

  await client.send(
    new DeleteRoleCommand({
      RoleName: roleName
    })
  );
};
