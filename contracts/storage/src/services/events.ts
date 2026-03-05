import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { LinkedVariables } from '@ez4/project/library';
import type { BucketListener } from './listener';
import type { BucketHandler } from './handler';
import type { BucketEvent } from './event';

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
   * Log level for the handler.
   */
  readonly logLevel?: LogLevel;

  /**
   * Architecture for the handler.
   */
  readonly architecture?: ArchitectureType;

  /**
   * Runtime for the handler.
   */
  readonly runtime?: RuntimeType;

  /**
   * Max execution time (in seconds) for the handler.
   */
  readonly timeout?: number;

  /**
   * Amount of memory available (in megabytes) for the handler.
   */
  readonly memory?: number;

  /**
   * Additional resources files for the bundler.
   */
  readonly files?: string[];

  /**
   * Determines whether or not VPC is enabled for the event.
   */
  readonly vpc?: boolean;
}
