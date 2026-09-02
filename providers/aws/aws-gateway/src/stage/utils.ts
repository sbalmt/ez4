import type { EntryState } from '@ez4/state';
import type { StageState } from './types';

import { StageServiceType } from './types';

export const isStageState = (resource: EntryState): resource is StageState => {
  return resource.type === StageServiceType;
};
