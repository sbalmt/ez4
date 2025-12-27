import type { ServiceArchitecture, ServiceRuntime } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { BucketEvent, BucketHandler, BucketListener } from './common';

/**
 * Bucket events.
 */
export interface BucketEvents {
  /**
   * Life-cycle listener function for the event.
   */
  readonly listener?: BucketListener<BucketEvent>;

  /**
   * Entry-point handler function for the event.
   */
  readonly handler: BucketHandler<BucketEvent>;

  /**
   * Path associated to the event.
   */
  readonly path?: string;

  /**
   * Variables associated to the handler.
   */
  readonly variables?: LinkedVariables;

  /**
   * Log retention (in days) for the handler.
   */
  readonly logRetention?: number;

  /**
   * Max execution time (in seconds) for the handler.
   */
  readonly timeout?: number;

  /**
   * Amount of memory available (in megabytes) for the handler.
   */
  readonly memory?: number;

  /**
   * Architecture for the handler.
   */
  readonly architecture?: ServiceArchitecture;

  /**
   * Runtime for the handler.
   */
  readonly runtime?: ServiceRuntime;
}
