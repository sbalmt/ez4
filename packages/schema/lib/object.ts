export namespace Object {
  export type Any = {
    '@ez4/schema': 'object';
    extensible: true;
  };

  export type Default<Type, Value extends Type> = {
    '@ez4/schema': 'object';
    default: Value;
    type: Type;
  };
}
