import { GatewayDefaults } from '@ez4/gateway/library';
import { FunctionDefaults } from '@ez4/aws-function';

export namespace Defaults {
  /**
   * Default stage name.
   */
  export const StageName = 'stream';

  /**
   * Default function and route timeout.
   */
  export const Timeout = GatewayDefaults.Timeout;

  /**
   * Default function memory.
   */
  export const Memory = GatewayDefaults.Memory;

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
}
