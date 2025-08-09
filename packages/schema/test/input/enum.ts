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
   * Enum values union.
   */
  union: TestSingleEnum | TestEnum | 'literal' | 123;

  /**
   * Nullable property.
   */
  nullable: TestEnum | null;

  /**
   * Optional property.
   */
  optional: TestEnum | undefined;

  /**
   * Nullable and optional property.
   */
  both?: TestEnum | null;

  /**
   * Default enum value.
   */
  default: Enum.Default<TestEnum, TestEnum.FOO>;
}
