import { FunctionDefaults } from '@ez4/aws-function';

export namespace Defaults {
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
   * Default function timeout.
   */
  export const Timeout = FunctionDefaults.Timeout;

  /**
   * Default function memory.
   */
  export const Memory = FunctionDefaults.Memory;

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
  export const Delay = 0;
}
