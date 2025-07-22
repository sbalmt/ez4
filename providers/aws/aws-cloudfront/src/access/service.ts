import type { EntryState, EntryStates } from '@ez4/stateful';
import type { AccessParameters, AccessState } from './types.js';

import { hashData, toKebabCase } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { AccessServiceType } from './types.js';

export const createOriginAccess = <E extends EntryState>(state: EntryStates<E>, parameters: AccessParameters) => {
  const accessName = toKebabCase(parameters.accessName);
  const accessId = hashData(AccessServiceType, accessName);

  return attachEntry<E | AccessState, AccessState>(state, {
    type: AccessServiceType,
    entryId: accessId,
    dependencies: [],
    parameters: {
      ...parameters,
      accessName
    }
  });
};
