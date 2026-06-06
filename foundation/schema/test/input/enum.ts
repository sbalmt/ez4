import type { Enum } from '@ez4/schema';

enum TestEnum {
  /**
   * @description Foo option.
   */
  FOO = 'foo',
  BAR = 'bar'
}

const enum TestSingleEnum {
  BAZ = 'baz'
}

/**
 * Internal test description.
 *
 * @description Enum test object.
 */
export interface EnumTestSchema {
  /**
   * @description Any enum value.
   */
  any: TestEnum[];

  /**
   * @description Strict enum value.
   */
  strict: TestEnum.BAR;

  /**
   * @description Single enum value.
   */
  single: TestSingleEnum;

  /**
   * @description Enum values union.
   */
  union: TestSingleEnum | TestEnum | 'literal' | 123;

  /**
   * @description Nullable property.
   */
  nullable: TestEnum | null;

  /**
   * @description Optional property.
   */
  optional: TestEnum | undefined;

  /**
   * @description Nullable and optional property.
   */
  both?: TestEnum | null;

  /**
   * @description Default enum value.
   */
  default: Enum.Default<TestEnum, TestEnum.FOO>;
}
