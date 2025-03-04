/**
 * All service watcher events.
 */
export type ServiceWatcherEvent<T extends ServiceWatcherRequest> =
  | ServiceWatcherBeginEvent<T>
  | ServiceWatcherErrorEvent<T>
  | ServiceWatcherEndEvent<T>;

/**
 * Service watcher request base.
 */
export type ServiceWatcherRequest = {};

/**
 * Service watcher event type.
 */
export const enum WatcherEventType {
  Begin = 'begin',
  Error = 'error',
  End = 'end'
}

/**
 * Watcher event for the beginning of an execution.
 */
export type ServiceWatcherBeginEvent<T extends ServiceWatcherRequest> = {
  /**
   * Event type.
   */
  type: WatcherEventType.Begin;

  /**
   * Request object.
   */
  request: Partial<T>;
};

/**
 * Watcher event for errors within an execution.
 */
export type ServiceWatcherErrorEvent<T extends ServiceWatcherRequest> = {
  /**
   * Event type.
   */
  type: WatcherEventType.Error;

  /**
   * Request object.
   */
  request: Partial<T>;

  /**
   * Error object.
   */
  error: Error;
};

/**
 * Watcher event for the end of an execution.
 */
export type ServiceWatcherEndEvent<T extends ServiceWatcherRequest> = {
  /**
   * Event type.
   */
  type: WatcherEventType.End;

  /**
   * Request object.
   */
  request: Partial<T>;
};
