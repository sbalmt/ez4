/**
 * @description Circular object.
 */
type ObjectType = {
  foo1: ObjectType;
};

/**
 * @description Circular interface.
 */
interface InterfaceTest {
  foo2: InterfaceTest;
}

/**
 * @description Circular class.
 */
declare class ClassTest {
  foo3: ClassTest;
}

/**
 * Internal test description.
 *
 * @description Reference test object.
 */
export interface ReferenceTestSchema {
  /**
   * @description Foo property.
   */
  foo: ObjectType;

  /**
   * @description Bar property.
   */
  bar: InterfaceTest;

  /**
   * @description Baz property.
   */
  baz: ClassTest;
}
