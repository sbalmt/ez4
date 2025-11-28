import type { LinkedVariables } from '@ez4/project/library';
import type { BucketEvent, BucketHandler, BucketListener } from './common';

/**
 * Bucket events.
 */
export interface BucketEvents {
  /**
   * Event listener.
   */
  readonly listener?: BucketListener<BucketEvent>;

  /**
   * Event handler.
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
   * Amount of memory available for the handler.
   */
  readonly memory?: number;
}
