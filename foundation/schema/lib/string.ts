export namespace String {
  export type Any = {
    '@ez4/schema': 'string';
  };

  export type Upper = {
    '@ez4/schema': 'string';
    upper: true;
  };

  export type Lower = {
    '@ez4/schema': 'string';
    lower: true;
  };

  export type Trim = {
    '@ez4/schema': 'string';
    trim: true;
  };

  export type Min<Length extends number> = {
    '@ez4/schema': 'string';
    minLength: Length;
    trim: true;
  };

  export type Max<Length extends number> = {
    '@ez4/schema': 'string';
    maxLength: Length;
    trim: true;
  };

  export type Size<MinLength extends number, MaxLength extends number> = {
    '@ez4/schema': 'string';
    minLength: MinLength;
    maxLength: MaxLength;
    trim: true;
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

  export type UUID = {
    '@ez4/schema': 'uuid';
    lower: true;
    trim: true;
  };

  export type Email = {
    '@ez4/schema': 'email';
    lower: true;
    trim: true;
  };

  export type Time = {
    '@ez4/schema': 'time';
    trim: true;
  };

  export type Date = {
    '@ez4/schema': 'date';
    trim: true;
  };

  export type DateTime = {
    '@ez4/schema': 'date-time';
    trim: true;
  };

  export type Base64 = {
    '@ez4/schema': 'base64';
    trim: true;
  };
}
