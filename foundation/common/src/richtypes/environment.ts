import type { Service as ServiceContract } from '../services/contract';

export namespace Environment {
  /**
   * Bind a variable from the environment.
   */
  export type Variable<Name extends string> = Name;

  /**
   * Bind a variable or a default value from the environment.
   */
  export type VariableOrValue<_Name extends string, Default> = Default;

  /**
   * Bind all the service variables from the environment as a service.
   */
  export type ServiceVariables = {
    variables: true;
  };

  /**
   * Bind a service from the environment.
   */
  export type Service<T extends ServiceContract.Provider> = {
    reference: T;
  };
}
