/**
 * Regular entry state.
 */
export type EntryState<T extends string = string> = {
  type: T;
  entryId: string;
  dependencies: string[];
  connections?: string[];
  parameters: unknown;
  result?: unknown;
};

/**
 * Map of regular entry states.
 */
export type EntryStates<E extends EntryState = EntryState> = {
  [entityId: string]: E | undefined;
};
