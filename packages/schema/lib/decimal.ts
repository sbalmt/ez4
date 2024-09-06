export namespace Decimal {
  export type Any = {
    '@ez4/schema': 'decimal';
  };

  export type Min<Value extends number> = {
    '@ez4/schema': 'decimal';
    minValue: Value;
  };

  export type Max<Value extends number> = {
    '@ez4/schema': 'decimal';
    maxValue: Value;
  };

  export type Range<MinValue extends number, MaxValue extends number> = {
    '@ez4/schema': 'decimal';
    minValue: MinValue;
    maxValue: MaxValue;
  };
}
