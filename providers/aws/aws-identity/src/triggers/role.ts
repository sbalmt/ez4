import type { RoleResourceEvent } from '@ez4/project/library';
import type { EntryState } from '@ez4/stateful';
import type { PolicyState } from '../policy/types';

import { getServiceName } from '@ez4/project/library';

import { createRole } from '../role/service';
import { createPolicy } from '../policy/service';
import { isPolicyState } from '../policy/utils';
import { createPolicyDocument } from '../utils/policy';
import { createRoleDocument, createRoleStatement } from '../utils/role';
import { getAccountId } from '../utils/account';

export const prepareExecutionRole = async (event: RoleResourceEvent) => {
  const { state, grants, accounts, policies, options } = event;

  if (!accounts.length) {
    return null;
  }

  const policyList = preparePolicies(policies);
  const accountId = await getAccountId();

  const namePrefix = getServiceName('', options);

  if (grants.length > 0) {
    const policyResource = createPolicy(state, {
      policyName: `${namePrefix}-policy`,
      policyDocument: createPolicyDocument(grants),
      tags: options.tags
    });

    policyList.push(policyResource);
  }

  return createRole(state, policyList, {
    roleName: `${namePrefix}-role`,
    tags: options.tags,
    roleDocument: createRoleDocument([
      createRoleStatement(
        {
          permissions: ['sts:AssumeRole'],
          resourceIds: []
        },
        accounts,
        accountId
      )
    ])
  });
};

const preparePolicies = (policies: EntryState[]) => {
  const policySet = new Set<string>();
  const policyList: PolicyState[] = [];

  for (const policy of policies) {
    if (!isPolicyState(policy) || policySet.has(policy.parameters.policyName)) {
      continue;
    }

    policySet.add(policy.parameters.policyName);

    policyList.push(policy);
  }

  // Ensure same position to not trigger updates without real changes.
  policyList.sort((a, b) => a.entryId.localeCompare(b.entryId));

  return policyList;
};
