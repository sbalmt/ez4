import type { DecomposeIndexName, PrimaryIndexes, UniqueIndexes } from './indexes.js';
import type { DatabaseEngine } from './engine.js';
import type { RelationMetadata } from './relations.js';
import type { InsensitiveUtils } from './insensitive.js';
import type { PaginationUtils } from './pagination.js';
import type { TableMetadata } from './table.js';
import type { OrderUtils } from './order.js';
import type { Database } from './database.js';

import type {
  AnyObject,
  PartialProperties,
  PartialObject,
  FlatObject,
  OptionalObject,
  StrictObject,
  IsNullable,
  IsObjectEmpty,
  IsObject,
  IsArray
} from '@ez4/utils';

/**
 * Query builder types.
 */
export namespace Query {
  export type InsertOneInput<S extends AnyObject, T extends TableMetadata> = {
    select?: StrictSelectInput<S, T>;
    data: InsertDataInput<T>;
  };

  export type UpdateOneInput<S extends AnyObject, T extends TableMetadata> = {
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    data: OptionalObject<UpdateDataInput<T>>;
    where: WhereInput<T, true>;
  };

  export type FindOneInput<S extends AnyObject, T extends TableMetadata> = {
    select: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    where: WhereInput<T, true>;
  };

  export type UpsertOneInput<S extends AnyObject, T extends TableMetadata> = {
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    update: OptionalObject<UpdateDataInput<T>>;
    insert: InsertDataInput<T>;
    where: WhereInput<T, true>;
  };

  export type DeleteOneInput<S extends AnyObject, T extends TableMetadata> = {
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    where: WhereInput<T, true>;
  };

  export type InsertManyInput<T extends TableMetadata> = {
    data: T['schema'][];
  };

  export type UpdateManyInput<S extends AnyObject, T extends TableMetadata> = PaginationUtils.End<T['engine']> & {
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    data: OptionalObject<UpdateDataInput<T>>;
    where?: WhereInput<T>;
  };

  export type FindManyInput<S extends AnyObject, T extends TableMetadata, C extends boolean> = PaginationUtils.Range<T['engine']> & {
    count?: C;
    select: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    where?: WhereInput<T>;
    order?: OrderInput<T>;
  };

  export type DeleteManyInput<S extends AnyObject, T extends TableMetadata> = PaginationUtils.End<T['engine']> & {
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    where?: WhereInput<T>;
  };

  export type CountInput<T extends TableMetadata> = {
    where?: WhereInput<T>;
  };

  export type InsertOneResult<S extends AnyObject, T extends TableMetadata> = S extends never ? void : Record<S, T>;

  export type UpdateOneResult<S extends AnyObject, T extends TableMetadata> = S extends never ? void : Record<S, T> | undefined;

  export type FindOneResult<S extends AnyObject, T extends TableMetadata> = S extends never ? void : Record<S, T> | undefined;

  export type UpsertOneResult<S extends AnyObject, T extends TableMetadata> = S extends never ? void : Record<S, T>;

  export type DeleteOneResult<S extends AnyObject, T extends TableMetadata> = S extends never ? void : Record<S, T> | undefined;

  export type UpdateManyResult<S extends AnyObject, T extends TableMetadata> = S extends never ? void : Record<S, T>[];

  export type InsertManyResult = void;

  export type FindManyResult<S extends AnyObject, T extends TableMetadata, C extends boolean> = PaginationUtils.Result<T['engine']> &
    (C extends true ? { records: Record<S, T>[]; total: number } : { records: Record<S, T>[] });

  export type DeleteManyResult<S extends AnyObject, T extends TableMetadata> = Record<S, T>[];

  export type Record<S extends AnyObject, T extends TableMetadata> = S extends never
    ? undefined
    : PartialObject<SelectFields<T['schema'], T['relations']>, S, false>;

  export type SelectInput<T extends TableMetadata> = PartialProperties<SelectFields<T['schema'], T['relations']>>;

  export type StrictSelectInput<S extends AnyObject, T extends TableMetadata> = StrictObject<
    S,
    FlatObject<SelectFields<T['schema'], T['relations']>>
  >;

  export type InsertDataInput<T extends TableMetadata> = Omit<
    IsObjectEmpty<T['relations']['changes']> extends true ? T['schema'] : T['schema'] & T['relations']['changes'],
    T['relations']['indexes']
  >;

  export type UpdateDataInput<T extends TableMetadata> = AtomicDataInput<
    Omit<
      IsObjectEmpty<T['relations']['changes']> extends true ? T['schema'] : T['schema'] & FlatObject<T['relations']['changes']>,
      T['relations']['indexes']
    >
  >;

  export type OrderInput<T extends TableMetadata> = OrderUtils.Input<T>;

  export type StrictIncludeInput<S extends AnyObject, T extends TableMetadata> =
    IsObjectEmpty<T['relations']['filters']> extends true
      ? never
      : {
          [P in keyof T['relations']['filters']]?: P extends keyof S
            ? StrictIncludeRelation<T['relations']['filters'][P], T['engine']>
            : never;
        };

  export type StrictIncludeOrder<V extends AnyObject> = OrderUtils.AnyInput<V>;

  export type StrictIncludeRelation<V extends AnyObject, E extends DatabaseEngine> = PaginationUtils.Range<E> & {
    where?: WhereRelationField<V, E>;
    order?: StrictIncludeOrder<V>;
  };

  export type WhereInput<T extends TableMetadata, I extends boolean = false> = WhereInputFilters<T, I extends true ? T['indexes'] : {}> & {
    NOT?: WhereInput<T>;
    AND?: WhereInput<T>[];
    OR?: WhereInput<T>[];
  };

  type SelectFields<T extends Database.Schema, R extends RelationMetadata> =
    IsObjectEmpty<R['selects']> extends true ? T : T & R['selects'];

  type WhereOperations<V, E extends DatabaseEngine> =
    | WhereNegate<V>
    | WhereEqual<V>
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
    NOT?: WhereRelationField<V, E>;
    AND?: WhereRelationField<V, E>[];
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
    WhereRelationFilters<T['relations']['filters'], T['engine']>;

  export type WhereOperators = keyof (WhereNegate<any> &
    WhereEqual<any> &
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

  type WhereNegate<V> = {
    not: V;
  };

  type WhereEqual<V> = {
    equal: V;
  };

  type WhereGreaterThan<V> = {
    gt: V;
  };

  type WhereGreaterThanOrEqual<V> = {
    gte: V;
  };

  type WhereLessThan<V> = {
    lt: V;
  };

  type WhereLessThanOrEqual<V> = {
    lte: V;
  };

  type WhereIn<V> = {
    isIn: IsArray<V> extends true ? V : IsObject<V> extends true ? V : V[];
  };

  type WhereBetween<V> = {
    isBetween: [V, V];
  };

  type WhereIsMissing = {
    isMissing: boolean;
  };

  type WhereIsNull = {
    isNull: boolean;
  };

  type WhereStartsWith<E extends DatabaseEngine> = InsensitiveUtils.Input<E> & {
    startsWith: string;
  };

  type WhereContains<V, E extends DatabaseEngine> = (V extends string ? InsensitiveUtils.Input<E> : {}) & {
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
    [P in keyof T as T[P] extends undefined ? never : P]: AtomicDataField<T[P]>;
  };

  type AtomicOptionalFields<T extends AnyObject> = {
    [P in keyof T as T[P] extends undefined ? P : never]?: AtomicDataField<T[P]>;
  };

  type AtomicOperation = AtomicIncrement | AtomicDecrement | AtomicMultiply | AtomicDivide;

  type AtomicIncrement = {
    increment: number;
  };

  type AtomicDecrement = {
    decrement: number;
  };

  type AtomicMultiply = {
    multiply: number;
  };

  type AtomicDivide = {
    divide: number;
  };
}
