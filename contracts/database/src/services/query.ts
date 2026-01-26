import type { DecomposeIndexName, PrimaryIndexes, UniqueIndexes } from './indexes';
import type { DatabaseEngine } from './engine';
import type { RelationMetadata } from './relations';
import type { InsensitiveModeUtils } from './insensitive';
import type { PaginationModeUtils } from './pagination';
import type { OrderModeUtils } from './order';
import type { LockModeUtils } from './lock';
import type { TableMetadata } from './table';
import type { Database } from './contract';

import type {
  AnyObject,
  PartialProperties,
  PartialObject,
  FlatObject,
  OptionalObject,
  StrictObject,
  IsNullable,
  IsUndefined,
  IsObjectEmpty,
  IsObject,
  Prettify
} from '@ez4/utils';

/**
 * Query builder types.
 */
export namespace Query {
  export type InsertOneInput<S extends AnyObject, T extends TableMetadata> = {
    select?: StrictSelectInput<S, T>;
    data: Prettify<InsertDataInput<T>>;
  };

  export type UpdateOneInput<S extends AnyObject, T extends TableMetadata> = {
    lock?: LockModeUtils.Input<T>;
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    data: Prettify<OptionalObject<UpdateDataInput<T>>>;
    where: WhereInput<T, true>;
  };

  export type FindOneInput<S extends AnyObject, T extends TableMetadata> = {
    lock?: LockModeUtils.Input<T>;
    select: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    where: WhereInput<T, true>;
  };

  export type UpsertOneInput<S extends AnyObject, T extends TableMetadata> = {
    lock?: LockModeUtils.Input<T>;
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    update: Prettify<OptionalObject<UpdateDataInput<T>>>;
    insert: Prettify<InsertDataInput<T>>;
    where: WhereInput<T, true>;
  };

  export type DeleteOneInput<S extends AnyObject, T extends TableMetadata> = {
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    where: WhereInput<T, true>;
  };

  export type InsertManyInput<T extends TableMetadata> = {
    data: Prettify<T['schema']>[];
  };

  export type UpdateManyInput<S extends AnyObject, T extends TableMetadata> = PaginationModeUtils.End<T['engine']> & {
    lock?: LockModeUtils.Input<T>;
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    data: Prettify<OptionalObject<UpdateDataInput<T>>>;
    where?: WhereInput<T>;
  };

  export type FindManyInput<S extends AnyObject, C extends boolean, T extends TableMetadata> = PaginationModeUtils.Range<T['engine']> & {
    lock?: LockModeUtils.Input<T>;
    select: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    where?: WhereInput<T>;
    order?: OrderInput<T>;
    count?: C;
  };

  export type DeleteManyInput<S extends AnyObject, T extends TableMetadata> = PaginationModeUtils.End<T['engine']> & {
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    where?: WhereInput<T>;
  };

  export type CountInput<T extends TableMetadata> = {
    where?: WhereInput<T>;
  };

  export type InsertOneResult<S extends AnyObject, T extends TableMetadata> = SelectInput<T> extends S ? void : Record<S, T>;

  export type UpdateOneResult<S extends AnyObject, T extends TableMetadata> = SelectInput<T> extends S ? void : Record<S, T> | undefined;

  export type FindOneResult<S extends AnyObject, T extends TableMetadata> = SelectInput<T> extends S ? void : Record<S, T> | undefined;

  export type UpsertOneResult<S extends AnyObject, T extends TableMetadata> = SelectInput<T> extends S ? void : Record<S, T>;

  export type DeleteOneResult<S extends AnyObject, T extends TableMetadata> = SelectInput<T> extends S ? void : Record<S, T> | undefined;

  export type UpdateManyResult<S extends AnyObject, T extends TableMetadata> = SelectInput<T> extends S ? void : Record<S, T>[];

  export type InsertManyResult = void;

  export type FindManyResult<S extends AnyObject, C extends boolean, T extends TableMetadata> = PaginationModeUtils.Result<T['engine']> & {
    records: SelectInput<T> extends S ? void : Record<S, T>[];
  } & (false extends C ? {} : { total: number });

  export type DeleteManyResult<S extends AnyObject, T extends TableMetadata> = SelectInput<T> extends S ? void : Record<S, T>[];

  export type Record<S extends AnyObject, T extends TableMetadata> = PartialObject<SelectOutputFields<T['schema'], T['relations']>, S>;

  export type SelectInput<T extends TableMetadata> = PartialProperties<SelectInputFields<T['schema'], T['relations']>>;

  export type StrictSelectInput<S extends AnyObject, T extends TableMetadata> = StrictObject<
    S,
    SelectInputFields<T['schema'], T['relations']>
  >;

  export type InsertDataInput<T extends TableMetadata> =
    IsObjectEmpty<T['relations']['inserts']> extends false
      ? Omit<T['schema'], T['relations']['indexes']> & T['relations']['inserts']
      : T['schema'];

  export type UpdateDataInput<T extends TableMetadata> =
    IsObjectEmpty<T['relations']['updates']> extends false
      ? AtomicDataInput<Omit<T['schema'], T['relations']['indexes']> & FlatObject<T['relations']['updates']>>
      : AtomicDataInput<T['schema']>;

  export type OrderInput<T extends TableMetadata> = OrderModeUtils.Input<T>;

  export type StrictIncludeInput<S extends AnyObject, T extends TableMetadata> =
    IsObjectEmpty<T['relations']['filters']> extends true
      ? never
      : {
          [P in keyof T['relations']['filters']]?: P extends keyof S
            ? StrictIncludeRelation<NonNullable<T['relations']['filters'][P]>, T['engine']>
            : never;
        };

  export type StrictIncludeOrder<V extends AnyObject> = OrderModeUtils.AnyInput<V>;

  export type StrictIncludeRelation<V extends AnyObject, E extends DatabaseEngine> = PaginationModeUtils.Range<E> & {
    where?: WhereRelationField<V, E>;
    order?: StrictIncludeOrder<V>;
  };

  export type WhereInput<T extends TableMetadata, I extends boolean = false> = Prettify<
    WhereInputFilters<T, I extends true ? T['indexes'] : {}> & {
      /**
       * Check whether the expression is not true.
       */
      NOT?: WhereInput<T>;

      /**
       * Check whether all the expressions are true.
       */
      AND?: WhereInput<T>[];

      /**
       * Check whether any of all the expressions are true.
       */
      OR?: WhereInput<T>[];
    }
  >;

  type SelectInputFields<T extends Database.Schema, R extends RelationMetadata> =
    IsObjectEmpty<R['selects']> extends true ? T : T & R['selects'];

  type SelectOutputFields<T extends Database.Schema, R extends RelationMetadata> =
    IsObjectEmpty<R['records']> extends true ? T : T & R['records'];

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
    | WhereStartsWith<E>
    | WhereContains<V, E>;

  type WhereField<V, E extends DatabaseEngine> =
    IsObject<V> extends false
      ? V | WhereOperations<V, E>
      : IsNullable<V> extends true
        ? null | WhereObjectField<NonNullable<V>, E>
        : WhereObjectField<NonNullable<V>, E>;

  type WhereObjectField<V extends AnyObject, E extends DatabaseEngine> = {
    [P in keyof V]?: WhereField<V[P], E>;
  };

  type WhereRelationField<V extends AnyObject, E extends DatabaseEngine> = WhereObjectField<V, E> & {
    /**
     * Check whether the expression is not true.
     */
    NOT?: WhereRelationField<V, E>;

    /**
     * Check whether all the expressions are true.
     */
    AND?: WhereRelationField<V, E>[];

    /**
     * Check whether any of all the expressions are true.
     */
    OR?: WhereRelationField<V, E>[];
  };

  type WhereRelationFilters<V extends AnyObject, E extends DatabaseEngine> = {
    [P in keyof V]?: IsObject<V[P]> extends true
      ? IsObjectEmpty<V[P]> extends false
        ? null | WhereRelationField<V[P], E>
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
    WhereStartsWith<never> &
    WhereContains<any, never>);

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

  export type AtomicOperators = keyof (AtomicIncrement & AtomicDecrement & AtomicMultiply & AtomicDivide);

  type AtomicDataInput<T extends AnyObject> = AtomicRequiredFields<T> & AtomicOptionalFields<T>;

  type AtomicDataField<T> = T extends number
    ? AtomicOperation | T
    : T extends AnyObject
      ? AtomicDataInput<T>
      : NonNullable<T> extends AnyObject
        ? null | AtomicDataInput<NonNullable<T>>
        : T;

  type AtomicRequiredFields<T extends AnyObject> = {
    [P in keyof T as IsUndefined<T[P]> extends true ? never : P]: AtomicDataField<T[P]>;
  };

  type AtomicOptionalFields<T extends AnyObject> = {
    [P in keyof T as IsUndefined<T[P]> extends true ? P : never]?: AtomicDataField<T[P]>;
  };

  type AtomicOperation = AtomicIncrement | AtomicDecrement | AtomicMultiply | AtomicDivide;

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
}
