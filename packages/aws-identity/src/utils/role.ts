import type { IdentityAccount, IdentityGrant } from '@ez4/project/library';
import type { RoleDocument } from '../types/role.js';

import { isArn } from '@ez4/aws-common';

const getSourceType = (source: string) => {
  return isArn(source) ? 'AWS:SourceArn' : 'AWS:SourceAccount';
};

export const createRoleDocument = (grant: IdentityGrant, services: IdentityAccount[], source: string): RoleDocument => {
  const sourceType = getSourceType(source);

  const { permissions, resourceIds } = grant;

  return {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'ID',
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
      }
    ]
  };
};
