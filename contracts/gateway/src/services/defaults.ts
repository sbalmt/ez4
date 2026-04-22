import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { WebPreferences } from './preferences';

/**
 * Default service parameters.
 */
export interface WebDefaults {
  /**
   * Default preferences for all handlers.
   *
   * @example
   * ```ts
   * preferences: {
   *   namingStyle: NamingStyle.SnakeCase;
   * }
   * ```
   */
  readonly preferences?: WebPreferences;

  /**
   * Specifies the default number of days logs should be retained.
   *
   * - Applies to the handler's log group.
   */
  readonly logRetention?: number;

  /**
   * Sets the log level for all handlers.
   *
   * - Controls the verbosity of logs emitted by the runtime.
   */
  readonly logLevel?: LogLevel;

  /**
   * Defines the CPU architecture for all handlers.
   *
   * - ARM architectures may reduce cost and improve performance.
   * - x86 architectures may be better for heavy workloads.
   */
  readonly architecture?: ArchitectureType;

  /**
   * Specifies the default runtime environment for all handlers.
   *
   * - Determines the Node.js runtime version used.
   * - Must match supported provider runtimes.
   */
  readonly runtime?: RuntimeType;

  /**
   * Default execution time (in seconds) for all handlers.
   *
   * - Requests exceeding this limit are terminated by the gateway.
   */
  readonly timeout?: number;

  /**
   * Default amount of memory allocated for all handlers (in MB).
   *
   * - Higher memory increases CPU allocation proportionally.
   * - Useful for compute‑heavy or parallel workloads.
   */
  readonly memory?: number;

  /**
   * Additional files to include in all handler bundles.
   *
   * - Useful for static assets, configuration files, or templates.
   * - Paths are relative to the project root.
   *
   * @example
   * ```ts
   * files: ['icon.png', 'settings.json']
   * ```
   */
  readonly files?: string[];

  /**
   * Enables debug mode for all handlers.
   *
   * - May enable additional logging or diagnostics.
   * - Behavior depends on the provider and runtime.
   */
  readonly debug?: boolean;
}
