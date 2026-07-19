import type { AnyObject, IsObject } from '@ez4/utils';
import type { PreserveNull } from './utils';

export type AtomicFields<T extends AnyObject> = {
  [P in keyof T]?: AtomicField<T[P]>;
};

type AtomicField<T> = T extends number
  ? AtomicIncrement | AtomicDecrement | AtomicMultiply | AtomicDivide | T
  : IsObject<T> extends true
    ? PreserveNull<T, AtomicFields<NonNullable<T>> | AtomicReplaceWith<NonNullable<T>>>
    : T;

type AtomicReplaceWith<T extends AnyObject> = {
  /**
   * Replace the entry value with the given object.
   */
  replaceWith: T;
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
