enum TestEnum {
  /**
   * Foo option.
   */
  FOO = 'foo',
  BAR = 'bar'
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
}
