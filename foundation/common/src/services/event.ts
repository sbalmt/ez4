import type { ServiceEventType } from '../types/event';
import type { ServiceRequest } from './request';

/**
 * All service events.
 */
export type ServiceAnyEvent<T extends ServiceRequest> =
  | ServiceBeginEvent<T>
  | ServiceReadyEvent<T>
  | ServiceDoneEvent<T>
  | ServiceErrorEvent<T>
  | ServiceEndEvent<T>;

/**
 * Service event for the beginning of an execution.
 */
export type ServiceBeginEvent<T extends ServiceRequest> = {
  /**
   * Event type.
   */
  type: ServiceEventType.Begin;

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
  type: ServiceEventType.Ready;

  /**
   * Event request.
   */
  request: Partial<T>;
};

/**
 * Service event for an execution ready to start.
 */
export type ServiceDoneEvent<T extends ServiceRequest> = {
  /**
   * Event type.
   */
  type: ServiceEventType.Done;

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
  type: ServiceEventType.Error;

  /**
   * Event request.
   */
  request: Partial<T>;

  /**
   * Event error.
   */
  error: unknown;
};

/**
 * Service event for the end of an execution.
 */
export type ServiceEndEvent<T extends ServiceRequest> = {
  /**
   * Event type.
   */
  type: ServiceEventType.End;

  /**
   * Event request.
   */
  request: Partial<T>;
};
