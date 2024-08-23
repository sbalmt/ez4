import type { IdentityAccount } from '@ez4/project/library';
import type { RoleDocument } from '../types/role.js';

export const createRoleDocument = (accounts: IdentityAccount[]): RoleDocument => {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'ID',
        Effect: 'Allow',
        Action: 'sts:AssumeRole',
        Principal: {
          Service: accounts.map(({ account }) => account)
        }
      }
    ]
  };
};
