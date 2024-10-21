/**
 * Circular object.
 */
type ObjectType = {
  foo1: ObjectType;
};

/**
 * Circular interface.
 */
interface InterfaceTest {
  foo2: InterfaceTest;
}

/**
 * Circular class.
 */
declare class ClassTest {
  foo3: ClassTest;
}

/**
 * Reference test object.
 */
export interface ReferenceTestSchema {
  /**
   * Foo property.
   */
  foo: ObjectType;

  /**
   * Bar property.
   */
  bar: InterfaceTest;

  /**
   * Baz property.
   */
  baz: ClassTest;
}
