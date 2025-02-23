export namespace Enum {
  export type Default<Type, Value extends Type> = {
    '@ez4/schema': 'enum';
    default: Value;
    type: Type;
  };
}
