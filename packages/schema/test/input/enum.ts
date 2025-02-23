import type { Enum } from '@ez4/schema';

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
   * Any enum value.
   */
  any: TestEnum[];

  /**
   * Strict enum value.
   */
  strict: TestEnum.BAR;

  /**
   * Single enum value.
   */
  single: TestSingleEnum;

  /**
   * Default enum value.
   */
  value: Enum.Default<TestEnum, TestEnum.FOO>;
}
