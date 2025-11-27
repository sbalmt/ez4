import type { LinkedVariables } from '@ez4/project/library';
import type { BucketEvent, BucketHandler, BucketListener } from './common';

/**
 * Bucket events.
 */
export interface BucketEvents {
  /**
   * Event listener.
   */
  listener?: BucketListener<BucketEvent>;

  /**
   * Event handler.
   */
  handler: BucketHandler<BucketEvent>;

  /**
   * Path associated to the event.
   */
  path?: string;

  /**
   * Variables associated to the handler.
   */
  variables?: LinkedVariables;

  /**
   * Log retention (in days) for the handler.
   */
  logRetention?: number;

  /**
   * Max execution time (in seconds) for the handler.
   */
  timeout?: number;

  /**
   * Amount of memory available for the handler.
   */
  memory?: number;
}
