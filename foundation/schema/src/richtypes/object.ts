import type { AnyObject } from '@ez4/utils';

export namespace Object {
  /**
   * Any object value.
   */
  export type Any = AnyObject;

  /**
   * Any object extending the object value.
   */
  export type Extends<Type extends AnyObject> = Type;

  /**
   * Object in base64 format.
   */
  export type Base64<Type extends AnyObject> = Type;

  /**
   * Object with default value.
   */
  export type Default<Type extends AnyObject, _Value extends Type> = Type;

  /**
   * Object without any predefined naming style.
   */
  export type Preserve<Type extends AnyObject> = Type;
}
