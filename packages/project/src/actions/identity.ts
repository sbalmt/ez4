import type { EntryState, EntryStates } from '@ez4/stateful';
import type { IdentityAccount, IdentityGrant } from '../types/identity.js';
import type { DeployOptions } from '../types/deploy.js';

import { MissingProviderError } from '../errors/provider.js';
import { triggerAllAsync } from '../library/triggers.js';

export const prepareExecutionRole = async (state: EntryStates, options: DeployOptions) => {
  const [grantsList, accountList, policyList] = await Promise.all([
    prepareIdentityGrantList(options),
    prepareIdentityAccountList(options),
    prepareExecutionPolicyList(state, options)
  ]);

  const role = await triggerAllAsync('deploy:prepareExecutionRole', (handler) =>
    handler({
      state,
      grants: grantsList,
      accounts: accountList,
      policies: policyList,
      options
    })
  );

  if (!role) {
    throw new MissingProviderError('deploy:prepareExecutionRole');
  }

  return role;
};

const prepareIdentityGrantList = async (options: DeployOptions) => {
  const grantsList: IdentityGrant[] = [];

  await triggerAllAsync('deploy:prepareIdentityGrant', async (handler) => {
    const grants = await handler({ options });

    if (grants) {
      grantsList.push(grants);
    }

    return null;
  });

  return grantsList;
};

const prepareIdentityAccountList = async (options: DeployOptions) => {
  const accountList: IdentityAccount[] = [];

  await triggerAllAsync('deploy:prepareIdentityAccount', async (handler) => {
    const accounts = await handler({ options });

    if (accounts) {
      accountList.push(...accounts);
    }

    return null;
  });

  return accountList;
};

const prepareExecutionPolicyList = async (state: EntryStates, options: DeployOptions) => {
  const policyList: EntryState[] = [];

  await triggerAllAsync('deploy:prepareExecutionPolicy', async (handler) => {
    const policy = await handler({ state, options });

    if (policy) {
      policyList.push(policy);
    }

    return null;
  });

  return policyList;
};
