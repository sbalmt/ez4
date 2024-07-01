export namespace Environment {
  export type Variable<T extends string> = {
    '@ez4/project': 'variable';
    variable: T;
  };

  export type Service<T> = {
    '@ez4/project': 'service';
    service: T;
  };
}
