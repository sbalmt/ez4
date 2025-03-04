/**
 * All service events.
 */
export type ServiceEvent<T extends ServiceRequest> =
  | ServiceBeginEvent<T>
  | ServiceReadyEvent<T>
  | ServiceErrorEvent<T>
  | ServiceEndEvent<T>;

/**
 * Service request base.
 */
export type ServiceRequest = {};

/**
 * Service event type.
 */
export const enum EventType {
  Begin = 'begin',
  Ready = 'ready',
  Error = 'error',
  End = 'end'
}

/**
 * Service event for the beginning of an execution.
 */
export type ServiceBeginEvent<T extends ServiceRequest> = {
  /**
   * Event type.
   */
  type: EventType.Begin;

  /**
   * Event request.
   */
  request: Partial<T>;
};

/**
 * Service event for an execution ready to start.
 */
export type ServiceReadyEvent<T extends ServiceRequest> = {
  /**
   * Event type.
   */
  type: EventType.Ready;

  /**
   * Event request.
   */
  request: Partial<T>;
};

/**
 * Service event for errors within an execution.
 */
export type ServiceErrorEvent<T extends ServiceRequest> = {
  /**
   * Event type.
   */
  type: EventType.Error;

  /**
   * Event request.
   */
  request: Partial<T>;

  /**
   * Event error.
   */
  error: Error;
};

/**
 * Service event for the end of an execution.
 */
export type ServiceEndEvent<T extends ServiceRequest> = {
  /**
   * Event type.
   */
  type: EventType.End;

  /**
   * Event request.
   */
  request: Partial<T>;
};
