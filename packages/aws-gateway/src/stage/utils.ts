import type { EntryState } from '@ez4/stateful';
import type { StageState } from './types.js';

import { StageServiceType } from './types.js';

export const isStageState = (resource: EntryState): resource is StageState => {
  return resource.type === StageServiceType;
};
