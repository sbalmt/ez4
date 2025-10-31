export namespace Environment {
  export type Variable<Name extends string> = {
    '@ez4/project': 'variable';
    variable: Name;
  };

  export type Value<Name extends string, Default> = {
    '@ez4/project': 'value';
    variable: Name;
    default: Default;
  };

  export type Variables = {
    '@ez4/project': 'variables';
  };

  export type Service<T> = {
    '@ez4/project': 'service';
    service: T;
  };
}
