import type { Service as ServiceContract } from '../services/contract';

export namespace Environment {
  /**
   * Bind a variable from the environment.
   *
   * @example
   * ```ts
   * variables: {
   *   varName: Environment.Variable<'ENV_VAR_NAME'>;
   * }
   * ```
   */
  export type Variable<Name extends string> = Name;

  /**
   * Bind a variable from the environment, or fall back to a literal default value
   * when the environment variable is missing.
   *
   * @example
   * ```ts
   * variables: {
   *   varName: Environment.VariableOrValue<'ENV_VAR_NAME', 'default value'>;
   * }
   * ```
   */
  export type VariableOrValue<_Name extends string, Default> = Default;

  /**
   * Inject all variables declared in the current service into the execution context.
   *
   * @example
   * ```ts
   * services: {
   *   variables: Environment.ServiceVariables;
   * }
   */
  export type ServiceVariables = {
    variables: true;
  };

  /**
   * Bind another service into the current service context.
   *
   * @example
   * ```ts
   * services: {
   *   anotherService: Environment.Service<AnotherService>;
   * }
   */
  export type Service<T extends ServiceContract.Provider> = {
    reference: T;
  };
}
