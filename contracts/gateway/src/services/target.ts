import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { LinkedVariables } from '@ez4/project/library';
import type { WebPreferences } from './preferences';

/**
 * Target configuration.
 */
export interface WebTarget {
  /**
   * Defines handler‑specific preference options.
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
   * Declares environment variables associated with the handler.
   *
   * - Supports both mapped variables and literal values.
   * - Variables here are only accessible through `process.env`.
   *
   * @example
   * ```ts
   * variables: {
   *   VARIABLE_A: Environment.Variable<'ENV_VAR_NAME'>;
   *   VARIABLE_B: 'literal value';
   * }
   * ```
   */
  readonly variables?: LinkedVariables;

  /**
   * Specifies the number of days logs should be retained.
   *
   * - Applies to the handler's log group.
   */
  readonly logRetention?: number;

  /**
   * Sets the log level for the handler.
   *
   * - Controls the verbosity of logs emitted by the runtime.
   */
  readonly logLevel?: LogLevel;

  /**
   * Defines the CPU architecture for the handler.
   *
   * - ARM architectures may reduce cost and improve performance.
   * - x86 architectures may be better for heavy workloads.
   */
  readonly architecture?: ArchitectureType;

  /**
   * Specifies the runtime environment for the handler.
   *
   * - Determines the Node.js runtime version used.
   * - Must match supported provider runtimes.
   */
  readonly runtime?: RuntimeType;

  /**
   * Maximum execution time (in seconds) for the handler.
   *
   * - Requests exceeding this limit are terminated by the gateway.
   */
  readonly timeout?: number;

  /**
   * Amount of memory allocated to the handler (in MB).
   *
   * - Higher memory increases CPU allocation proportionally.
   * - Useful for compute‑heavy or parallel workloads.
   */
  readonly memory?: number;

  /**
   * Additional files to include in the handler bundle.
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
   * Enables debug mode for the handler.
   *
   * - May enable additional logging or diagnostics.
   * - Behavior depends on the provider and runtime.
   */
  readonly debug?: boolean;
}
