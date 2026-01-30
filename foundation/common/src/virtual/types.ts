import type { LinkedServices } from '@ez4/project/library';
import type { EntryState } from '@ez4/stateful';

import { ServiceType } from '../metadata/types';

export type VirtualStateParameters = {
  services?: LinkedServices;
};

export type VirtualState = EntryState & {
  type: typeof ServiceType;
  parameters: VirtualStateParameters;
};

export const isVirtualState = (resource: EntryState): resource is VirtualState => {
  return resource.type === ServiceType;
};
