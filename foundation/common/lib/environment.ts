export namespace Environment {
  export type Variable<Name extends string> = {
    '@ez4/project': 'variable';
    variable: Name;
  };

  export type VariableOrValue<Name extends string, Default> = {
    '@ez4/project': 'value';
    variable: Name;
    default: Default;
  };

  export type ServiceVariables = {
    '@ez4/project': 'variables';
  };

  export type ServiceOptions = {
    '@ez4/project': 'options';
  };

  export type Service<T, U> = {
    '@ez4/project': 'service';
    reference: T;
    options: U;
  };
}
