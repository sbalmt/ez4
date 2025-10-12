import type { IdentityAccount, IdentityGrant } from '@ez4/project/library';
import type { RoleDocument, RoleStatement } from '../types/role';

import { isArn } from '@ez4/aws-common';

const getSourceType = (source: string) => {
  return isArn(source) ? 'AWS:SourceArn' : 'AWS:SourceAccount';
};

export const createRoleStatement = (grant: IdentityGrant, services: IdentityAccount[], source: string): RoleStatement => {
  const sourceType = getSourceType(source);

  const principalServices = services.map(({ account }) => account);

  const { permissions, resourceIds } = grant;

  return {
    Sid: 'EZ4',
    Effect: 'Allow',
    Action: permissions,
    ...(resourceIds.length && {
      Resource: resourceIds
    }),
    Principal: {
      Service: principalServices.sort()
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
