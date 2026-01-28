import type { EntryState } from '@ez4/stateful';
import type { ValidationState } from './types';

import { ServiceType } from '../metadata/types';

export const isValidationState = (entry: EntryState): entry is ValidationState => {
  return entry.type === ServiceType;
};
