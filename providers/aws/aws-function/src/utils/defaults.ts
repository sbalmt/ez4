import { ServiceArchitecture, ServiceRuntime } from '@ez4/common';

export namespace FunctionDefaults {
  /**
   * Default log retention in days.
   */
  export const LogRetention = 90;

  /**
   * Default function architecture.
   */
  export const Architecture = ServiceArchitecture.x86;

  /**
   * Default function runtime.
   */
  export const Runtime = ServiceRuntime.Node24;

  /**
   * Default function timeout.
   */
  export const Timeout = 90;

  /**
   * Default function memory.
   */
  export const Memory = 192;
}
