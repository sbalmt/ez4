import type { EntryState } from './entry';

/**
 * An entry state containing its `dependents` entries.
 */
export type HydratedEntryState<T extends EntryState = EntryState> = T & {
  dependents: string[];
};
