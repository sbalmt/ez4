/**
 * Regular entry state.
 */
export type EntryState<T extends string = string> = {
  type: T;
  entryId: string;
  dependencies: string[];
  parameters: Record<string, any>;
  result?: Record<string, any>;
};

/**
 * Regular entry state with type overwritten.
 */
export type TypedEntryState<E extends EntryState, T extends string> = E & {
  type: T;
};

/**
 * Map of regular entry states.
 */
export type EntryStates<E extends EntryState = EntryState> = {
  [entityId: string]: E | undefined;
};
