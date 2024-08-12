import type { ObjectComparison } from '@ez4/utils';
import type { StepAction } from '../state/step.js';

import type { EntryState, TypedEntryState } from './entry.js';

/**
 * A step state that contains an action to perform.
 */
export type StepState = {
  action: StepAction;
  entryId: string;
  order: number;
  preview?: ObjectComparison;
};

/**
 * Context containing helper methods for the step.
 */
export type StepContext<E extends EntryState = EntryState> = {
  /**
   * Get all dependencies from the current step entry, if a `type` is given
   * the resulting list is filtered by type.
   *
   * @param type Optional filter type.
   * @returns Returns a list containing all the current step entry dependencies.
   */
  getDependencies: <T extends string>(type?: T) => TypedEntryState<E, T>[];
};

/**
 * A step handler containing a function for each action supported.
 */
export type StepHandler<E extends EntryState = EntryState> = {
  /**
   * Handle entry comparison.
   * @param candidate Candidate entry.
   * @param current Current entry.
   * @returns Must returns `true` when candidate and current are the same or `false` otherwise.
   */
  equals: (candidate: Readonly<E>, current: Readonly<E>) => boolean | Promise<boolean>;

  /**
   * Handle entry creation.
   * @param candidate Candidate entry.
   * @param context Action context.
   * @returns Must returns the resulting state of the create action.
   */
  create: (
    candidate: Readonly<E>,
    context: StepContext<E>
  ) => Record<string, any> | undefined | Promise<Record<string, any> | unknown>;

  /**
   * Handle entry replacement.
   * @param candidate Candidate entry.
   * @param current Current entry.
   * @param context Action context.
   * @returns Must returns the resulting state of the replace action.
   */
  replace: (
    candidate: Readonly<E>,
    current: Readonly<E>,
    context: StepContext<E>
  ) => Record<string, any> | undefined | Promise<Record<string, any> | undefined>;

  /**
   * Handle entry preview.
   * @param candidate Candidate entry.
   * @param current Current entry.
   * @returns Must returns the comparison object from the preview action.
   */
  preview: (
    candidate: Readonly<E>,
    current: Readonly<E>
  ) => ObjectComparison | undefined | Promise<ObjectComparison | undefined>;

  /**
   * Handle entry updates.
   * @param candidate Candidate entry.
   * @param current Current entry.
   * @param context Action context.
   * @returns Must returns the resulting state of the update action.
   */
  update: (
    candidate: Readonly<E>,
    current: Readonly<E>,
    context: StepContext<E>
  ) => Record<string, any> | undefined | Promise<Record<string, any> | undefined>;

  /**
   * Handle entry deletion.
   * @param candidate Candidate entry.
   * @param context Action context.
   * @returns Must returns the resulting state of the delete action.
   */
  delete: (candidate: Readonly<E>, context: StepContext<E>) => void | Promise<void>;
};

/**
 * A map of step handlers.
 */
export type StepHandlers<E extends EntryState = EntryState> = {
  [T in E['type']]: StepHandler<E & { type: T }>;
};
