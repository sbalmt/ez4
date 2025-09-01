import type { EntryState, EntryStates } from '@ez4/stateful';
import type { OriginParameters, OriginState } from './types';

import { hashData, toKebabCase } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { OriginServiceType } from './types';

export const createOriginPolicy = <E extends EntryState>(state: EntryStates<E>, parameters: OriginParameters) => {
  const policyName = toKebabCase(parameters.policyName);
  const policyId = hashData(OriginServiceType, policyName);

  return attachEntry<E | OriginState, OriginState>(state, {
    type: OriginServiceType,
    entryId: policyId,
    dependencies: [],
    parameters: {
      ...parameters,
      policyName
    }
  });
};
