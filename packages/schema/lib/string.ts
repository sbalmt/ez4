export namespace String {
  export type Any = {
    '@ez4/schema': 'string';
  };

  export type Min<Length extends number> = {
    '@ez4/schema': 'string';
    minLength: Length;
  };

  export type Max<Length extends number> = {
    '@ez4/schema': 'string';
    maxLength: Length;
  };

  export type Size<MinLength extends number, MaxLength extends number> = {
    '@ez4/schema': 'string';
    minLength: MinLength;
    maxLength: MaxLength;
  };

  export type Default<Value extends string> = {
    '@ez4/schema': 'string';
    default: Value;
  };

  export type Regex<Pattern extends string, Name extends string> = {
    '@ez4/schema': 'regex';
    pattern: Pattern;
    name: Name;
  };

  export type Date = {
    '@ez4/schema': 'date';
  };

  export type Time = {
    '@ez4/schema': 'time';
  };

  export type DateTime = {
    '@ez4/schema': 'date-time';
  };

  export type UUID = {
    '@ez4/schema': 'uuid';
  };

  export type Email = {
    '@ez4/schema': 'email';
  };
}
