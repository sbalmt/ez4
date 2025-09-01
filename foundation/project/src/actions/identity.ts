import type { MetadataReflection } from '@ez4/project/library';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { IdentityAccount, IdentityGrant } from '../types/identity';
import type { DeployOptions } from '../types/options';

import { triggerAllAsync } from '@ez4/project/library';

import { MissingActionProviderError } from '../errors/provider';

export const prepareExecutionRole = async (state: EntryStates, metadata: MetadataReflection, options: DeployOptions) => {
  const serviceTypes = getAllServiceTypes(metadata);

  const grantsList = await prepareIdentityGrantList(serviceTypes, options);
  const accountList = await prepareIdentityAccountList(serviceTypes, options);
  const policyList = await prepareExecutionPolicyList(state, serviceTypes, options);

  const role = await triggerAllAsync('deploy:prepareExecutionRole', (handler) =>
    handler({
      state,
      grants: grantsList,
      accounts: accountList,
      policies: policyList,
      options
    })
  );

  if (role === undefined) {
    throw new MissingActionProviderError('deploy:prepareExecutionRole');
  }

  return role;
};

const getAllServiceTypes = (metadata: MetadataReflection) => {
  const serviceTypes = new Set<string>();

  for (const identity in metadata) {
    const service = metadata[identity];

    serviceTypes.add(service.type);
  }

  return [...serviceTypes.values()];
};

const prepareIdentityGrantList = async (serviceTypes: string[], options: DeployOptions) => {
  const grantsList: IdentityGrant[] = [];

  for (const serviceType of serviceTypes) {
    await triggerAllAsync('deploy:prepareIdentityGrant', async (handler) => {
      const grants = await handler({ serviceType, options });

      if (grants) {
        grantsList.push(grants);
      }

      return null;
    });
  }

  return grantsList;
};

const prepareIdentityAccountList = async (serviceTypes: string[], options: DeployOptions) => {
  const accountList: IdentityAccount[] = [];

  for (const serviceType of serviceTypes) {
    await triggerAllAsync('deploy:prepareIdentityAccount', async (handler) => {
      const accounts = await handler({ serviceType, options });

      if (accounts) {
        accountList.push(...accounts);
      }

      return null;
    });
  }

  return accountList;
};

const prepareExecutionPolicyList = async (state: EntryStates, serviceTypes: string[], options: DeployOptions) => {
  const policyList: EntryState[] = [];

  for (const serviceType of serviceTypes) {
    await triggerAllAsync('deploy:prepareExecutionPolicy', async (handler) => {
      const policy = await handler({ state, serviceType, options });

      if (policy) {
        policyList.push(policy);
      }

      return null;
    });
  }

  return policyList;
};
