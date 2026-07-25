import type { AnyObject, IsObject, IsObjectEmpty, Prettify } from '@ez4/utils';
import type { DecomposeIndexName, PrimaryIndexes, UniqueIndexes } from '../indexes';
import type { InsensitiveModeUtils } from '../insensitive';
import type { DatabaseEngine } from '../engine';
import type { TableMetadata } from '../table';
import type { Database } from '../contract';
import type { PreserveNull } from './utils';

export type WhereFieldInput<T extends TableMetadata, I extends boolean = false> = Prettify<
  WhereInputFilters<T, I extends true ? T['indexes'] : {}> & {
    /**
     * Check whether the expression is not true.
     */
    NOT?: WhereFieldInput<T>;

    /**
     * Check whether all the expressions are true.
     */
    AND?: WhereFieldInput<T>[];

    /**
     * Check whether any of all the expressions are true.
     */
    OR?: WhereFieldInput<T>[];
  }
>;

export type WhereRelationInput<T extends AnyObject, E extends DatabaseEngine> = WhereObjectField<T, E> & {
  /**
   * Check whether the expression is not true.
   */
  NOT?: WhereRelationInput<T, E>;

  /**
   * Check whether all the expressions are true.
   */
  AND?: WhereRelationInput<T, E>[];

  /**
   * Check whether any of all the expressions are true.
   */
  OR?: WhereRelationInput<T, E>[];
};

export type WhereOperators = keyof (WhereNegate<any, never> &
  WhereEqual<any, never> &
  WhereGreaterThan<any> &
  WhereGreaterThanOrEqual<any> &
  WhereLessThan<any> &
  WhereLessThanOrEqual<any> &
  WhereIn<any> &
  WhereBetween<any> &
  WhereIsMissing &
  WhereIsNull &
  WhereIsMissingOrNull &
  WhereStartsWith<never> &
  WhereContains<any, never>);

type WhereOperations<V, E extends DatabaseEngine> =
  | WhereNegate<V, E>
  | WhereEqual<V, E>
  | WhereGreaterThan<V>
  | WhereGreaterThanOrEqual<V>
  | WhereLessThan<V>
  | WhereLessThanOrEqual<V>
  | WhereIn<V>
  | WhereBetween<V>
  | WhereIsMissing
  | WhereIsNull
  | WhereIsMissingOrNull
  | WhereStartsWith<E>
  | WhereContains<V, E>;

type WhereField<V, E extends DatabaseEngine> =
  IsObject<V> extends true ? PreserveNull<V, WhereObjectField<NonNullable<V>, E>> : V | WhereOperations<V, E>;

type WhereObjectField<V extends AnyObject, E extends DatabaseEngine> = {
  [P in keyof V]?: WhereField<V[P], E>;
};

type WhereRelationFilters<V extends AnyObject, E extends DatabaseEngine> = {
  [P in keyof V]?: IsObject<V[P]> extends true
    ? IsObjectEmpty<V[P]> extends false
      ? null | WhereRelationInput<V[P], E>
      : null | {}
    : never;
};

type WhereIndexFields<I extends Database.Indexes> = PrimaryIndexes<I> & UniqueIndexes<I>;

type WhereRequiredFilters<V extends AnyObject, I extends Database.Indexes> = {
  [P in keyof WhereIndexFields<I>]: { [N in DecomposeIndexName<P>]: V[N] };
}[keyof WhereIndexFields<I>];

type WhereOptionalFilters<V extends AnyObject, T extends TableMetadata, I extends Database.Indexes> = {
  [P in Exclude<keyof V, keyof WhereIndexFields<I>>]?: WhereField<V[P], T['engine']>;
};

type WhereCommonFilters<V extends AnyObject, T extends TableMetadata, I extends Database.Indexes> =
  IsObjectEmpty<I> extends true ? WhereObjectField<V, T['engine']> : WhereRequiredFilters<V, I> & WhereOptionalFilters<V, T, I>;

type WhereInputFilters<T extends TableMetadata, I extends Database.Indexes> = WhereCommonFilters<T['schema'], T, I> &
  (IsObjectEmpty<T['relations']['filters']> extends false ? WhereRelationFilters<T['relations']['filters'], T['engine']> : {});

type WhereNegate<V, E extends DatabaseEngine> = (V extends string ? InsensitiveModeUtils.Input<E> : {}) & {
  /**
   * Check whether the entity value is not equal to the given one.
   */
  not: V;
};

type WhereEqual<V, E extends DatabaseEngine> = (V extends string ? InsensitiveModeUtils.Input<E> : {}) & {
  /**
   * Check whether the entity value is equal to the given one.
   */
  equal: V;
};

type WhereGreaterThan<V> = {
  /**
   * Check whether the entity value is greater than the given one.
   */
  gt: V;
};

type WhereGreaterThanOrEqual<V> = {
  /**
   * Check whether the entity value is greater than or equal the given one.
   */
  gte: V;
};

type WhereLessThan<V> = {
  /**
   * Check whether the entity value is less than the given one.
   */
  lt: V;
};

type WhereLessThanOrEqual<V> = {
  /**
   * Check whether the entity value is less than or equal the given one.
   */
  lte: V;
};

type WhereIn<V> = {
  /**
   * Check whether the entity value is in the given ones.
   */
  isIn: Exclude<V, undefined>[];
};

type WhereBetween<V> = {
  /**
   * Check whether the entity value is between the given ones.
   */
  isBetween: [Exclude<V, undefined>, Exclude<V, undefined>];
};

type WhereIsMissing = {
  /**
   * Check whether the entity value is missing.
   */
  isMissing: boolean;
};

type WhereIsNull = {
  /**
   * Check whether the entity value is null.
   */
  isNull: boolean;
};

type WhereIsMissingOrNull = {
  /**
   * Check whether the entity value is missing or null.
   */
  isMissingOrNull: boolean;
};

type WhereStartsWith<E extends DatabaseEngine> = InsensitiveModeUtils.Input<E> & {
  /**
   * Check whether the entity value starts with the given one.
   */
  startsWith: string;
};

type WhereContains<V, E extends DatabaseEngine> = (V extends string ? InsensitiveModeUtils.Input<E> : {}) & {
  /**
   * Check whether the entity value contains the given one.
   */
  contains: IsObject<V> extends true ? Partial<V> : V;
};
