/**
 * Regular entry state.
 */
export type EntryState<T extends string = string> = {
  /**
   * Entry type.
   */
  type: T;

  /**
   * Entry identifier.
   */
  entryId: string;

  /**
   * List of identifiers for all dependent entries.
   */
  dependencies: string[];

  /**
   * List of identifiers for all connected entries.
   */
  connections?: string[];

  /**
   * Determines whether or not the last apply was partial.
   */
  partial?: boolean;

  /**
   * All entry parameters.
   */
  parameters: unknown;

  /**
   * Entry result.
   */
  result?: unknown;
};

/**
 * Map of regular entry states.
 */
export type EntryStates<E extends EntryState = EntryState> = {
  [entityId: string]: E | undefined;
};

/**
 * Extract all the entry types.
 */
export type EntryTypes<T extends EntryState> = T['type'];
