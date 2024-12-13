enum TestEnum {
  /**
   * Foo option.
   */
  FOO = 'foo',
  BAR = 'bar'
}

const enum TestSingleEnum {
  BAZ = 'baz'
}

/**
 * Enum test object.
 */
export interface EnumTestSchema {
  /**
   * Foo property.
   */
  foo: TestEnum[];

  /**
   * Bar property.
   */
  bar: TestEnum.BAR;

  /**
   * Baz property.
   */
  baz: TestSingleEnum;
}
