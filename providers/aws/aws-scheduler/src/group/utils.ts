import type { EntryState, StepContext } from '@ez4/stateful';
import type { GroupState } from './types.js';

import { GroupServiceType } from './types.js';

export const isGroupState = (resource: EntryState): resource is GroupState => {
  return resource.type === GroupServiceType;
};

export const tryGetGroupName = (context: StepContext) => {
  const resource = context.getDependencies<GroupState>(GroupServiceType);

  return resource[0]?.parameters.groupName;
};
