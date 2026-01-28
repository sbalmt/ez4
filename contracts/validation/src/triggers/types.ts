import type { LinkedServices } from '@ez4/project/library';
import type { EntryState } from '@ez4/stateful';
import type { ServiceType } from '../metadata/types';

export type ValidationState = EntryState & {
  type: typeof ServiceType;
  parameters: {
    services: LinkedServices;
  };
};
