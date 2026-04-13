import type { LinkedVariables } from '@ez4/project/library';

export interface AuthProvider {
  /**
   * Declares environment variables that apply to every authorizer using this provider.
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
   * Declares service bindings available to authorizers using this provider.
   *
   * - Each entry represents a service that will be injected into authorizers.
   * - Useful for exposing shared infrastructure or internal services.
   *
   * @example
   * ```ts
   * services: {
   *   serviceA: Environment.ServiceVariables; // For variables service
   *   serviceB: Environment.Service<ServiceB>; // For contract service
   * }
   * ```
   */
  readonly services: Record<string, unknown>;
}
