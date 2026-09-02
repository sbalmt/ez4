import type { EntryState } from '@ez4/state';
import type { ResponseState } from './types';

import { ResponseServiceType } from './types';

export const isResponseState = (resource: EntryState): resource is ResponseState => {
  return resource.type === ResponseServiceType;
};
