import type { EntryState } from './entry.js';

/**
 * Entry state containing its `dependents` entries.
 */
export type HydratedEntryState<T extends EntryState = EntryState> = T & {
  dependents: string[];
};
