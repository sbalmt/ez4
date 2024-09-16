import type { RoleResourceEvent } from '@ez4/project/library';

import { createRole } from '../role/service.js';
import { createPolicy } from '../policy/service.js';
import { createPolicyDocument } from '../utils/policy.js';
import { createRoleDocument } from '../utils/role.js';
import { isPolicyState } from '../policy/utils.js';
import { getAccountId } from '../utils/account.js';

export const prepareExecutionRole = async (event: RoleResourceEvent) => {
  const { state, grants, accounts, policies, options } = event;
  const { resourcePrefix, projectName } = options;

  if (!accounts.length) {
    return null;
  }

  const policyList = policies.filter((policy) => isPolicyState(policy));
  const accountId = await getAccountId();

  const namePrefix = `${resourcePrefix}-${projectName}`;

  if (grants.length > 0) {
    const policyResource = createPolicy(state, {
      policyName: `${namePrefix}-policy`,
      policyDocument: createPolicyDocument(grants)
    });

    policyList.push(policyResource);
  }

  return createRole(state, policyList, {
    roleName: `${namePrefix}-role`,
    roleDocument: createRoleDocument(
      {
        permissions: ['sts:AssumeRole'],
        resourceIds: []
      },
      accounts,
      accountId
    )
  });
};
