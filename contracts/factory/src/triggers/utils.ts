import type { EntryState } from '@ez4/stateful';
import type { FactoryState } from './types';

import { ServiceType } from '../metadata/types';

export const isFactoryState = (entry: EntryState): entry is FactoryState => {
  return entry.type === ServiceType;
};
