import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { LinkedVariables } from '@ez4/project/library';
import type { BucketObjectEvent } from './object';
import type { BucketListener } from './listener';
import type { BucketHandler } from './handler';

/**
 * Bucket event.
 */
export interface BucketEvent {
  /**
   * Path associated to the event.
   */
  readonly path: string;

  /**
   * Life-cycle listener function for the event.
   */
  readonly listener?: BucketListener<BucketObjectEvent>;

  /**
   * Entry-point handler function for the event.
   */
  readonly handler: BucketHandler<BucketObjectEvent>;

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
   * Additional resource files for the handler bundler.
   */
  readonly files?: string[];

  /**
   * Determine whether the debug mode is active for the handler.
   */
  readonly debug?: boolean;

  /**
   * Determines whether or not VPC is enabled for the event.
   */
  readonly vpc?: boolean;
}
