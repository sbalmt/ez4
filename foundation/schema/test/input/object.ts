import type { Object } from '@ez4/schema';

/**
 * Internal test description.
 *
 * @description Referenced object.
 */
type ObjectType = {
  foo1: boolean;
  bar1: number;
  baz1: string;
};

/**
 * Internal test description.
 *
 * @description Referenced interface.
 */
interface InterfaceTest {
  foo2: boolean;
  bar2: number;
  baz2: string;
}

/**
 * Internal test description.
 *
 * @description Referenced class.
 */
declare class ClassTest {
  foo3: boolean;
  bar3: number;
  baz3: string;
}

/**
 * Internal test description.
 *
 * @description Object test object.
 */
export interface ObjectTestSchema {
  /**
   * @description Foo property.
   */
  foo: ObjectType;

  // Inherit description from interface.
  bar: InterfaceTest;

  // Inherit description from class.
  baz: ClassTest;

  /**
   * @description Nullable property.
   */
  nullable: ObjectType | null;

  /**
   * @description Optional property.
   */
  optional: ObjectType | undefined;

  /**
   * @description Nullable and optional property.
   */
  both?: ObjectType | null;

  /**
   * @description Any object type.
   */
  any: Object.Any;

  /**
   * @description Default object value.
   */
  default: Object.Default<ObjectType, { foo1: true; bar1: 123; baz1: 'baz' }>;

  /**
   * @description Dynamic properties.
   */
  dynamic: { [name: string | number]: boolean | undefined };

  /**
   * @description Any object extending.
   */
  extends: Object.Extends<{ foo: boolean; bar: number; baz: string }>;

  /**
   * @description Intersection object.
   */
  intersection: { foo: number } & { foo: string; bar: string };

  /**
   * @description Any object extending intersection.
   */
  extends_intersection: Object.Extends<{ foo: string } & { bar: number }>;

  /**
   * @description Dynamic object intersection.
   */
  dynamic_intersection: Object.Extends<{ [name: string]: number }>;

  /**
   * @description Base64-encoded object.
   */
  encoded: Object.Base64<{ foo: number; bar: string }>;

  /**
   * @description Combined base64-encoded, extended and default object.
   */
  combined: Object.Base64<Object.Extends<Object.Default<{ foo: string; bar: number }, { foo: 'foo'; bar: 123 }>>>;

  /**
   * @description Preserve object naming style.
   */
  preserve: Object.Preserve<{ foo: number; bar: string }>;
}
