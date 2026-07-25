import type { AnyObject, IsAllTrue, IsNullish, IsObject } from '@ez4/utils';
import type { PreserveNull } from './utils';

export type AtomicFields<T extends AnyObject, I extends boolean = false> = {
  [P in keyof T]?: AtomicField<T[P], IsNullish<T[P]>, I>;
};

type AtomicField<T, N extends boolean, I extends boolean> = T extends number
  ? AtomicIncrement | AtomicDecrement | AtomicMultiply | AtomicDivide | T
  : IsObject<T> extends true
    ? IsAllTrue<[N, I]> extends true
      ? PreserveNull<T, AtomicFields<NonNullable<T>, true> | AtomicReplaceWith<NonNullable<T>>> | AtomicRemoveFrom
      : PreserveNull<T, AtomicFields<NonNullable<T>, true> | AtomicReplaceWith<NonNullable<T>>>
    : IsAllTrue<[N, I]> extends true
      ? T | AtomicRemoveFrom
      : T;

type AtomicReplaceWith<T extends AnyObject> = {
  /**
   * Replace the entry value with the given object.
   */
  replaceWith: T;
};

type AtomicRemoveFrom = {
  /**
   * Remove the entry from the current object.
   */
  removeFrom: boolean;
};

type AtomicIncrement = {
  /**
   * Increment the entity value by the given amount.
   */
  increment: number;
};

type AtomicDecrement = {
  /**
   * Decrement the entity value by the given amount.
   */
  decrement: number;
};

type AtomicMultiply = {
  /**
   * Multiply the entity value by the given amount.
   */
  multiply: number;
};

type AtomicDivide = {
  /**
   * Divide the entity value by the given amount.
   */
  divide: number;
};
