import { QueueDefaults } from '@ez4/queue/library';
import { FunctionDefaults } from '@ez4/aws-function';

export namespace Defaults {
  /**
   * Default function log level.
   */
  export const LogLevel = FunctionDefaults.LogLevel;

  /**
   * Default log retention in days.
   */
  export const LogRetention = FunctionDefaults.LogRetention;

  /**
   * Default function architecture.
   */
  export const Architecture = FunctionDefaults.Architecture;

  /**
   * Default function runtime.
   */
  export const Runtime = FunctionDefaults.Runtime;

  /**
   * Default function memory.
   */
  export const Memory = QueueDefaults.Memory;

  /**
   * Default queue timeout.
   */
  export const Timeout = QueueDefaults.Timeout;

  /**
   * Default max attempts.
   */
  export const MaxAttempts = QueueDefaults.MaxAttempts;

  /**
   * Default min delay (in seconds) for backoff.
   */
  export const MinBackoff = QueueDefaults.MinBackoff;

  /**
   * Default max delay (in seconds) for backoff.
   */
  export const MaxBackoff = QueueDefaults.MaxBackoff;

  /**
   * Default queue retention (14 days)
   */
  export const Retention = 20160;

  /**
   * Default queue batch size.
   */
  export const Batch = 10;

  /**
   * Default queue delay.
   */
  export const Delay = QueueDefaults.Delay;
}
