import type { IdentityAccount } from '@ez4/project/library';
import type { RoleDocument } from '../types/role.js';

import { getAccountId } from '../utils/account.js';

export const createRoleDocument = async (accounts: IdentityAccount[]): Promise<RoleDocument> => {
  const accountId = await getAccountId();

  return {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'ID',
        Effect: 'Allow',
        Action: 'sts:AssumeRole',
        Principal: {
          Service: accounts.map(({ account }) => account)
        },
        Condition: {
          StringEquals: {
            'aws:SourceAccount': accountId
          }
        }
      }
    ]
  };
};
