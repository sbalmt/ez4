import type { AnyObject, IsAllTrue, IsNullish, IsObject } from '@ez4/utils';
import type { PreserveNull } from './utils';

export type AtomicFields<T extends AnyObject> = AtomicObjectFields<T, false>;

type AtomicObjectFields<T extends AnyObject, J extends boolean> = {
  [P in keyof T]?: AtomicObjectField<T[P], IsNullish<T[P]>, J>;
};

type AtomicObjectField<T, N extends boolean, J extends boolean> = T extends number
  ? AtomicIncrement | AtomicDecrement | AtomicMultiply | AtomicDivide | T
  : IsObject<T> extends true
    ? IsAllTrue<[N, J]> extends true
      ? PreserveNull<T, AtomicObjectFields<NonNullable<T>, true>> | AtomicReplaceWith<NonNullable<T>, N> | AtomicRemoveFrom
      : PreserveNull<T, AtomicObjectFields<NonNullable<T>, true>> | AtomicReplaceWith<NonNullable<T>, N>
    : IsAllTrue<[N, J]> extends true
      ? T | AtomicRemoveFrom
      : T;

type AtomicReplaceWith<T extends AnyObject, N extends boolean> = {
  /**
   * Replace the entry value with the given object.
   */
  replaceWith?: N extends true ? T | null : T;
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
