import type { DecomposeIndexName, PrimaryIndexes, UniqueIndexes } from './indexes.js';
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
    include?: StrictIncludeInput<T>;
    data: OptionalObject<UpdateDataInput<T>>;
    where: WhereInput<T, true>;
  };

  export type FindOneInput<S extends AnyObject, T extends TableMetadata> = {
    select: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<T>;
    where: WhereInput<T, true>;
  };

  export type UpsertOneInput<S extends AnyObject, T extends TableMetadata> = {
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<T>;
    update: OptionalObject<UpdateDataInput<T>>;
    insert: InsertDataInput<T>;
    where: WhereInput<T, true>;
  };

  export type DeleteOneInput<S extends AnyObject, T extends TableMetadata> = {
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<T>;
    where: WhereInput<T, true>;
  };

  export type InsertManyInput<T extends TableMetadata> = {
    data: T['schema'][];
  };

  export type UpdateManyInput<S extends AnyObject, T extends TableMetadata> = PaginationUtils.End<T> & {
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<T>;
    data: OptionalObject<UpdateDataInput<T>>;
    where?: WhereInput<T>;
  };

  export type FindManyInput<S extends AnyObject, T extends TableMetadata, C extends boolean> = PaginationUtils.Range<T> & {
    count?: C;
    select: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<T>;
    where?: WhereInput<T>;
    order?: OrderInput<T>;
  };

  export type DeleteManyInput<S extends AnyObject, T extends TableMetadata> = PaginationUtils.End<T> & {
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<T>;
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

  export type FindManyResult<S extends AnyObject, T extends TableMetadata, C extends boolean> = PaginationUtils.Result<T> &
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
    IndexFields<T['relations']>
  >;

  export type UpdateDataInput<T extends TableMetadata> = AtomicDataInput<
    Omit<
      IsObjectEmpty<T['relations']['changes']> extends true ? T['schema'] : T['schema'] & FlatObject<T['relations']['changes']>,
      IndexFields<T['relations']>
    >
  >;

  export type OrderInput<T extends TableMetadata, O extends AnyObject = T['schema']> = OrderUtils.Input<O, T['engine']>;

  export type StrictIncludeInput<T extends TableMetadata> =
    IsObjectEmpty<T['relations']['filters']> extends true
      ? never
      : {
          [P in keyof T['relations']['filters']]?: PaginationUtils.Range<T> & {
            where?: WhereRelationField<T['relations']['filters'][P], T>;
            order?: OrderInput<T, T['relations']['filters'][P]>;
          };
        };

  export type WhereInput<T extends TableMetadata, I extends boolean = false> = WhereInputFilters<T, I extends true ? T['indexes'] : {}> & {
    NOT?: WhereInput<T>;
    AND?: WhereInput<T>[];
    OR?: WhereInput<T>[];
  };

  type IndexFields<R extends RelationMetadata> = string extends R['indexes'] ? never : R['indexes'];

  type SelectFields<T extends Database.Schema, R extends RelationMetadata> =
    IsObjectEmpty<R['selects']> extends true ? T : T & R['selects'];

  type WhereOperations<V, T extends TableMetadata> =
    | WhereNegate<V, T>
    | WhereEqual<V>
    | WhereGreaterThan<V>
    | WhereGreaterThanOrEqual<V>
    | WhereLessThan<V>
    | WhereLessThanOrEqual<V>
    | WhereIn<V>
    | WhereBetween<V>
    | WhereIsMissing
    | WhereIsNull
    | WhereStartsWith<T>
    | WhereContains<V, T>;

  type WhereField<V, T extends TableMetadata> =
    IsObject<V> extends false
      ? V | WhereOperations<V, T>
      : IsNullable<V> extends true
        ? null | WhereObjectField<NonNullable<V>, T>
        : WhereObjectField<NonNullable<V>, T>;

  type WhereObjectField<V extends AnyObject, T extends TableMetadata> = {
    [P in keyof V]?: WhereField<V[P], T>;
  };

  type WhereRelationField<V extends AnyObject, T extends TableMetadata> = WhereObjectField<V, T> & {
    NOT?: WhereRelationField<V, T>;
    AND?: WhereRelationField<V, T>[];
    OR?: WhereRelationField<V, T>[];
  };

  type WhereRelationFilters<V extends AnyObject, T extends TableMetadata> = {
    [P in keyof V]?: IsObject<V[P]> extends true
      ? IsObjectEmpty<V[P]> extends false
        ? null | WhereRelationField<V[P], T>
        : null | {}
      : never;
  };

  type WhereIndexFields<I extends Database.Indexes> = PrimaryIndexes<I> & UniqueIndexes<I>;

  type WhereRequiredFilters<V extends AnyObject, I extends Database.Indexes> = {
    [P in keyof WhereIndexFields<I>]: { [N in DecomposeIndexName<P>]: V[N] };
  }[keyof WhereIndexFields<I>];

  type WhereOptionalFilters<V extends AnyObject, T extends TableMetadata, I extends Database.Indexes> = {
    [P in Exclude<keyof V, keyof WhereIndexFields<I>>]?: WhereField<V[P], T>;
  };

  type WhereCommonFilters<V extends AnyObject, T extends TableMetadata, I extends Database.Indexes> =
    IsObjectEmpty<I> extends true ? WhereObjectField<V, T> : WhereRequiredFilters<V, I> & WhereOptionalFilters<V, T, I>;

  type WhereInputFilters<T extends TableMetadata, I extends Database.Indexes> = WhereCommonFilters<T['schema'], T, I> &
    WhereRelationFilters<T['relations']['filters'], T>;

  export type WhereOperators = keyof (WhereNegate<any, never> &
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

  type WhereNegate<V, T extends TableMetadata> = {
    not: V | WhereOperations<V, T>;
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

  type WhereStartsWith<T extends TableMetadata> = InsensitiveUtils.Input<T> & {
    startsWith: string;
  };

  type WhereContains<V, T extends TableMetadata> = (V extends string ? InsensitiveUtils.Input<T> : {}) & {
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
