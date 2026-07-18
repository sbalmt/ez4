import type { AnyObject, IsUndefined, IsObject } from '@ez4/utils';
import type { PreserveNull } from './utils';

export type AtomicFields<T extends AnyObject> = {
  [P in keyof T]?: AtomicField<T[P], false>;
};

export type AtomicStrictFields<T extends AnyObject> = AtomicRequiredFields<T, true> & AtomicOptionalFields<T, true>;

type AtomicField<T, S> = T extends number
  ? AtomicIncrement | AtomicDecrement | AtomicMultiply | AtomicDivide | T
  : IsObject<T> extends true
    ? S extends true
      ? PreserveNull<T, AtomicStrictFields<NonNullable<T>>>
      : PreserveNull<T, AtomicFields<NonNullable<T>> | AtomicReplaceWith<NonNullable<T>>>
    : T;

type AtomicRequiredFields<T extends AnyObject, S> = {
  [P in keyof T as IsUndefined<T[P]> extends true ? never : P]: AtomicField<T[P], S>;
};

type AtomicOptionalFields<T extends AnyObject, S> = {
  [P in keyof T as IsUndefined<T[P]> extends true ? P : never]?: AtomicField<T[P], S>;
};

type AtomicReplaceWith<T extends AnyObject> = {
  /**
   * Replace the entry value with the given object.
   */
  replaceWith: AtomicStrictFields<T>;
};

type AtomicIncrement = {
  /**
   * Increment the entity value by the given amount.
   */
  inc: number;
};

type AtomicDecrement = {
  /**
   * Decrement the entity value by the given amount.
   */
  dec: number;
};

type AtomicMultiply = {
  /**
   * Multiply the entity value by the given amount.
   */
  mul: number;
};

type AtomicDivide = {
  /**
   * Divide the entity value by the given amount.
   */
  div: number;
};
