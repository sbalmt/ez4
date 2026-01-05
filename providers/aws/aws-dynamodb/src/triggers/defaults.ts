import { FunctionDefaults } from '@ez4/aws-function';

export namespace Defaults {
  /**
   * Default log retention in days.
   */
  export const LogRetention = FunctionDefaults.LogRetention;

  /**
   * Default stream architecture.
   */
  export const Architecture = FunctionDefaults.Architecture;

  /**
   * Default stream runtime.
   */
  export const Runtime = FunctionDefaults.Runtime;

  /**
   * Default stream timeout.
   */
  export const Timeout = FunctionDefaults.Timeout;

  /**
   * Default stream memory.
   */
  export const Memory = FunctionDefaults.Memory;
}
