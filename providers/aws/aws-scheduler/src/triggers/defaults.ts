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
}
