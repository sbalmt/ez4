import type { IdentityAccount, IdentityGrant } from '@ez4/project/library';
import type { RoleDocument, RoleStatement } from '../types/role.js';

import { isArn } from '@ez4/aws-common';

const getSourceType = (source: string) => {
  return isArn(source) ? 'AWS:SourceArn' : 'AWS:SourceAccount';
};

export const createRoleStatement = (grant: IdentityGrant, services: IdentityAccount[], source: string): RoleStatement => {
  const sourceType = getSourceType(source);

  const { permissions, resourceIds } = grant;

  return {
    Sid: 'EZ4',
    Effect: 'Allow',
    Action: permissions,
    ...(resourceIds.length && {
      Resource: resourceIds
    }),
    Principal: {
      Service: services.map(({ account }) => account)
    },
    Condition: {
      StringEquals: {
        [sourceType]: source
      }
    }
  };
};

export const createRoleDocument = (statements: RoleStatement[]): RoleDocument => {
  return {
    Version: '2012-10-17',
    Statement: statements
  };
};
