import type { LinkedVariables } from '@ez4/project/library';

/**
 * HTTP Provider
 */
export interface HttpProvider {
  /**
   * Declares environment variables that apply to every handler using this provider.
   *
   * - Supports both mapped variables and literal values.
   * - Provider‑level variables should not be accessed via `process.env`.
   * - Accessible through `Environment.ServiceVariables`.
   *
   * @example
   * ```ts
   * variables: {
   *   variableA: Environment.Variable<'ENV_VAR_NAME'>;
   *   variableB: 'literal value';
   * }
   * ```
   */
  readonly variables?: LinkedVariables;

  /**
   * Declares service bindings available to handlers using this provider.
   *
   * - Each entry represents a service that will be injected into handlers.
   * - Useful for exposing shared infrastructure or internal services.
   *
   * @example
   * ```ts
   * services: {
   *   variables: Environment.ServiceVariables;
   *   serviceA: Environment.Service<ServiceA>;
   *   serviceB: Environment.Service<ServiceB>;
   * }
   * ```
   */
  readonly services: Record<string, unknown>;
}
