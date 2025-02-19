import type { Object } from '@ez4/schema';

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

  // Inherit description from interface.
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

  /**
   * Any object type.
   */
  any: Object.Any;

  /**
   * Dynamic properties.
   */
  dynamic: {
    [name: string | number]: boolean | undefined;
  };

  /**
   * Default object value.
   */
  value: Object.Default<ObjectType, { foo1: true; bar1: 123; baz1: 'baz' }>;
}
