export namespace Decimal {
  type Format = 'decimal';

  export type Any = {
    '@ez4/schema': Format;
  };

  export type Min<Value extends number> = {
    '@ez4/schema': Format;
    minValue: Value;
  };

  export type Max<Value extends number> = {
    '@ez4/schema': Format;
    maxValue: Value;
  };

  export type Range<MinValue extends number, MaxValue extends number> = {
    '@ez4/schema': Format;
    minValue: MinValue;
    maxValue: MaxValue;
  };
}
