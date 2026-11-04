import type { MetadataReflection } from '@ez4/project/library';
import type { EntryState, EntryStates } from '@ez4/state';
import type { IdentityAccount, IdentityGrant } from '../types/identity';
import type { DeployOptions } from '../types/options';

import { triggerAllAsync } from '@ez4/project/library';

import { MissingActionProviderError } from '../errors/provider';

export const prepareExecutionRole = async (state: EntryStates, metadata: MetadataReflection, options: DeployOptions) => {
  const serviceTypes = getAllServiceTypes(metadata);

  const grantsList = await prepareIdentityGrantList(serviceTypes, metadata, options);
  const accountList = await prepareIdentityAccountList(serviceTypes, metadata, options);
  const policyList = await prepareExecutionPolicyList(state, serviceTypes, metadata, options);

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

const prepareIdentityGrantList = async (serviceTypes: string[], metadata: MetadataReflection, options: DeployOptions) => {
  const allServices = Object.values(metadata);
  const grantsList: IdentityGrant[] = [];

  for (const serviceType of serviceTypes) {
    await triggerAllAsync('deploy:prepareIdentityGrant', async (handler) => {
      const services = allServices.filter((service) => service.type === serviceType);
      const grants = await handler({ serviceType, services, options });

      if (grants) {
        grantsList.push(grants);
      }

      return null;
    });
  }

  return grantsList;
};

const prepareIdentityAccountList = async (serviceTypes: string[], metadata: MetadataReflection, options: DeployOptions) => {
  const allServices = Object.values(metadata);
  const accountList: IdentityAccount[] = [];

  for (const serviceType of serviceTypes) {
    await triggerAllAsync('deploy:prepareIdentityAccount', async (handler) => {
      const services = allServices.filter((service) => service.type === serviceType);
      const accounts = await handler({ serviceType, services, options });

      if (accounts) {
        accountList.push(...accounts);
      }

      return null;
    });
  }

  return [...new Map(accountList.map((account) => [account.account, account])).values()];
};

const prepareExecutionPolicyList = async (
  state: EntryStates,
  serviceTypes: string[],
  metadata: MetadataReflection,
  options: DeployOptions
) => {
  const allServices = Object.values(metadata);
  const policyList: EntryState[] = [];

  for (const serviceType of serviceTypes) {
    await triggerAllAsync('deploy:prepareExecutionPolicy', async (handler) => {
      const services = allServices.filter((service) => service.type === serviceType);
      const policies = await handler({ state, serviceType, services, options });

      if (policies) {
        policyList.push(...policies);
      }

      return null;
    });
  }

  return [...new Map(policyList.map((policy) => [policy.entryId, policy])).values()];
};
