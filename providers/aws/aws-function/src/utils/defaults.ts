import { ArchitectureType, RuntimeType, LogLevel as ProjectLogLevel } from '@ez4/project';

export namespace FunctionDefaults {
  /**
   * Default log retention in days.
   */
  export const LogRetention = 90;

  /**
   * Default function log level.
   */
  export const LogLevel = ProjectLogLevel.Warning;

  /**
   * Default function architecture.
   */
  export const Architecture = ArchitectureType.x86;

  /**
   * Default function runtime.
   */
  export const Runtime = RuntimeType.Node24;

  /**
   * Default function timeout.
   */
  export const Timeout = 90;

  /**
   * Default function memory.
   */
  export const Memory = 192;
}
