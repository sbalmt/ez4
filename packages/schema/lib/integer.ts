export namespace Integer {
  export type Any = {
    '@ez4/schema': 'integer';
  };

  export type Min<Value extends number> = {
    '@ez4/schema': 'integer';
    minValue: Value;
  };

  export type Max<Value extends number> = {
    '@ez4/schema': 'integer';
    maxValue: Value;
  };

  export type Range<MinValue extends number, MaxValue extends number> = {
    '@ez4/schema': 'integer';
    minValue: MinValue;
    maxValue: MaxValue;
  };
}
