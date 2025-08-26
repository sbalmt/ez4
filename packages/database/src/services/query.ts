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
  IsArray,
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
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    data: Prettify<OptionalObject<UpdateDataInput<T>>>;
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

  export type UpdateManyInput<S extends AnyObject, T extends TableMetadata> = PaginationUtils.End<T['engine']> & {
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    data: Prettify<OptionalObject<UpdateDataInput<T>>>;
    where?: WhereInput<T>;
  };

  export type FindManyInput<S extends AnyObject, C extends boolean, T extends TableMetadata> = PaginationUtils.Range<T['engine']> & {
    select: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    where?: WhereInput<T>;
    order?: OrderInput<T>;
    count?: C;
  };

  export type DeleteManyInput<S extends AnyObject, T extends TableMetadata> = PaginationUtils.End<T['engine']> & {
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

  export type FindManyResult<S extends AnyObject, C extends boolean, T extends TableMetadata> = PaginationUtils.Result<T['engine']> & {
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
    IsObjectEmpty<T['relations']['changes']> extends false
      ? Omit<T['schema'] & T['relations']['changes'], T['relations']['indexes']>
      : T['schema'];

  export type UpdateDataInput<T extends TableMetadata> = AtomicDataInput<
    IsObjectEmpty<T['relations']['changes']> extends false
      ? Omit<T['schema'] & FlatObject<T['relations']['changes']>, T['relations']['indexes']>
      : T['schema']
  >;

  export type OrderInput<T extends TableMetadata> = OrderUtils.Input<T>;

  export type StrictIncludeInput<S extends AnyObject, T extends TableMetadata> =
    IsObjectEmpty<T['relations']['filters']> extends true
      ? never
      : {
          [P in keyof T['relations']['filters']]?: P extends keyof S
            ? StrictIncludeRelation<NonNullable<T['relations']['filters'][P]>, T['engine']>
            : never;
        };

  export type StrictIncludeOrder<V extends AnyObject> = OrderUtils.AnyInput<V>;

  export type StrictIncludeRelation<V extends AnyObject, E extends DatabaseEngine> = PaginationUtils.Range<E> & {
    where?: WhereRelationField<V, E>;
    order?: StrictIncludeOrder<V>;
  };

  export type WhereInput<T extends TableMetadata, I extends boolean = false> = Prettify<
    WhereInputFilters<T, I extends true ? T['indexes'] : {}> & {
      NOT?: WhereInput<T>;
      AND?: WhereInput<T>[];
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

  type WhereNegate<V, E extends DatabaseEngine> = (V extends string ? InsensitiveUtils.Input<E> : {}) & {
    not: V;
  };

  type WhereEqual<V, E extends DatabaseEngine> = (V extends string ? InsensitiveUtils.Input<E> : {}) & {
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
