import { FunctionDefaults } from '@ez4/aws-function';

export namespace Defaults {
  /**
   * Default stage name.
   */
  export const StageName = 'stream';

  /**
   * Default function and route timeout.
   */
  export const Timeout = 30;

  /**
   * Default function memory.
   */
  export const Memory = FunctionDefaults.Memory;

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
}
