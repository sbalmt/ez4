import { StorageDefaults } from '@ez4/storage/library';
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
   * Default function timeout.
   */
  export const Timeout = StorageDefaults.Timeout;

  /**
   * Default function memory.
   */
  export const Memory = StorageDefaults.Memory;
}
