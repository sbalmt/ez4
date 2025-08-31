export namespace Array {
  export type Min<Type, Length extends number> = {
    '@ez4/schema': 'array';
    minLength: Length;
    type: Type;
  };

  export type Max<Type, Length extends number> = {
    '@ez4/schema': 'array';
    maxLength: Length;
    type: Type;
  };

  export type Size<Type, MinLength extends number, MaxLength extends number> = {
    '@ez4/schema': 'array';
    minLength: MinLength;
    maxLength: MaxLength;
    type: Type;
  };

  export type Default<Type, Value extends Type[]> = {
    '@ez4/schema': 'array';
    default: Value;
    type: Type;
  };

  export type Base64<Type> = {
    '@ez4/schema': 'array';
    encoded: true;
    type: Type;
  };
}
