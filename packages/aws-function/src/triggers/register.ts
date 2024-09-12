import type { IdentityAccount, PolicyResourceEvent } from '@ez4/project/library';

import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { createPolicy, registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { createTrigger } from '@ez4/project/library';

import { getPolicyDocument } from '../utils/policy.js';

let isRegistered = false;

/**
 * Register all triggers.
 */
export const registerTriggers = () => {
  if (!isRegistered) {
    registerAwsTriggers();
    registerAwsIdentityTriggers();

    createTrigger('@ez4/aws-function', {
      'deploy:prepareIdentityAccount': prepareIdentityAccount,
      'deploy:prepareExecutionPolicy': prepareExecutionPolicy
    });

    isRegistered = true;
  }

  return isRegistered;
};

const prepareIdentityAccount = (): IdentityAccount[] => {
  return [
    {
      account: 'lambda.amazonaws.com'
    }
  ];
};

const prepareExecutionPolicy = async (event: PolicyResourceEvent) => {
  const { state, options } = event;
  const { resourcePrefix, projectName } = options;

  const prefix = `${resourcePrefix}-${projectName}`;

  return createPolicy(state, {
    policyName: `${prefix}-lambda-policy`,
    policyDocument: await getPolicyDocument(prefix)
  });
};
