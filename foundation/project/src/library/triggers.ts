import type {
  AsyncEvent,
  AsyncEventTrigger,
  AsyncTriggerResult,
  SyncEvent,
  SyncEventTrigger,
  SyncTriggerResult,
  Trigger
} from '../types/trigger';

import { DuplicateTriggerError } from '../errors/triggers';

const allTriggers: Record<string, Partial<Trigger>> = {};

export const createTrigger = (identifier: string, trigger: Partial<Trigger>) => {
  if (identifier in allTriggers) {
    throw new DuplicateTriggerError(identifier);
  }

  allTriggers[identifier] = trigger;
};

export const triggerAllSync = <T extends keyof SyncEvent>(event: T, trigger: SyncEventTrigger<T>): SyncTriggerResult<T> | null => {
  for (const identifier in allTriggers) {
    const handler = (allTriggers[identifier] as SyncEvent)[event];

    if (!handler) {
      continue;
    }

    const result = trigger(handler);

    if (result) {
      return result;
    }
  }

  return null;
};

export const triggerAllAsync = async <T extends keyof AsyncEvent>(
  event: T,
  trigger: AsyncEventTrigger<T>
): Promise<AsyncTriggerResult<T> | null> => {
  for (const identifier in allTriggers) {
    const handler = (allTriggers[identifier] as AsyncEvent)[event];

    if (!handler) {
      continue;
    }

    const result = await trigger(handler);

    if (result) {
      return result;
    }
  }

  return null;
};
