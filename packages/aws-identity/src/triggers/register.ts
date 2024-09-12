import type { RoleResourceEvent } from '@ez4/project/library';

import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { createTrigger } from '@ez4/project/library';

import { isPolicy, createPolicy } from '../policy/service.js';
import { createPolicyDocument } from '../utils/policy.js';
import { createRoleDocument } from '../utils/role.js';
import { createRole } from '../role/service.js';

let isRegistered = false;

/**
 * Register all triggers.
 */
export const registerTriggers = () => {
  if (!isRegistered) {
    registerAwsTriggers();

    createTrigger('@ez4/aws-identity', {
      'deploy:prepareExecutionRole': prepareExecutionRole
    });

    isRegistered = true;
  }

  return isRegistered;
};

const prepareExecutionRole = async (event: RoleResourceEvent) => {
  const { state, grants, accounts, policies, options } = event;
  const { resourcePrefix, projectName } = options;

  if (!accounts.length) {
    return null;
  }

  const policyList = policies.filter((policy) => isPolicy(policy));
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
    roleDocument: createRoleDocument(accounts)
  });
};
