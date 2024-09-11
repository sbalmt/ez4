import type { EntryState, EntryStates } from '@ez4/stateful';
import type { RuleParameters, RuleState } from './types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { RuleServiceType } from './types.js';

export const isRule = (resource: EntryState): resource is RuleState => {
  return resource.type === RuleServiceType;
};

export const createRule = <E extends EntryState>(
  state: EntryStates<E>,
  parameters: RuleParameters
) => {
  const ruleName = toKebabCase(parameters.ruleName);
  const roleId = hashData(RuleServiceType, ruleName);

  return attachEntry<E | RuleState, RuleState>(state, {
    type: RuleServiceType,
    entryId: roleId,
    dependencies: [],
    parameters: {
      ...parameters,
      ruleName
    }
  });
};

export const getRule = <E extends EntryState>(state: EntryStates<E>, roleName: string) => {
  const roleId = hashData(toKebabCase(roleName));
  const roleState = state[roleId];

  if (roleState && isRule(roleState)) {
    return roleState;
  }

  return null;
};
