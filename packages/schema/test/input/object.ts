/**
 * Referenced object.
 */
type ObjectType = {
  foo1: boolean;
  bar1: number;
  baz1: string;
};

/**
 * Referenced interface.
 */
interface InterfaceTest {
  foo2: boolean;
  bar2: number;
  baz2: string;
}

/**
 * Referenced class.
 */
declare class ClassTest {
  foo3: boolean;
  bar3: number;
  baz3: string;
}

/**
 * Object test object.
 */
export interface ObjectTestSchema {
  /**
   * Foo property.
   */
  foo: ObjectType;

  /**
   * Bar property.
   */
  bar: InterfaceTest;

  // Inherit description from class.
  baz: ClassTest;

  /**
   * Nullable property.
   */
  nullable: ObjectType | null;

  /**
   * Optional property.
   */
  optional: ObjectType | undefined;

  /**
   * Nullable and optional property.
   */
  both?: ObjectType | null;
}
