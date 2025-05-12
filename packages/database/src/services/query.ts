import type { DecomposeIndexName, PrimaryIndexes, UniqueIndexes } from './indexes.js';
import type { RelationMetadata } from './relations.js';
import type { Database } from './database.js';
import type { Order } from './order.js';

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
  export type InsertOneInput<T extends Database.Schema, S extends AnyObject, R extends RelationMetadata> = {
    select?: StrictSelectInput<T, S, R>;
    data: InsertDataInput<T, R>;
  };

  export type UpdateOneInput<T extends Database.Schema, S extends AnyObject, I extends Database.Indexes, R extends RelationMetadata> = {
    select?: StrictSelectInput<T, S, R>;
    include?: StrictIncludeInput<S, R>;
    data: OptionalObject<UpdateDataInput<T, R>>;
    where: WhereInput<T, I, R>;
  };

  export type FindOneInput<T extends Database.Schema, S extends AnyObject, I extends Database.Indexes, R extends RelationMetadata> = {
    select: StrictSelectInput<T, S, R>;
    include?: StrictIncludeInput<S, R>;
    where: WhereInput<T, I, R>;
  };

  export type UpsertOneInput<T extends Database.Schema, S extends AnyObject, I extends Database.Indexes, R extends RelationMetadata> = {
    select?: StrictSelectInput<T, S, R>;
    include?: StrictIncludeInput<S, R>;
    update: OptionalObject<UpdateDataInput<T, R>>;
    insert: InsertDataInput<T, R>;
    where: WhereInput<T, I, R>;
  };

  export type DeleteOneInput<T extends Database.Schema, S extends AnyObject, I extends Database.Indexes, R extends RelationMetadata> = {
    select?: StrictSelectInput<T, S, R>;
    include?: StrictIncludeInput<S, R>;
    where: WhereInput<T, I, R>;
  };

  export type InsertManyInput<T extends Database.Schema = {}> = {
    data: T[];
  };

  export type UpdateManyInput<T extends Database.Schema, S extends AnyObject, R extends RelationMetadata> = {
    select?: StrictSelectInput<T, S, R>;
    include?: StrictIncludeInput<S, R>;
    data: OptionalObject<UpdateDataInput<T, R>>;
    where?: WhereInput<T, {}, R>;
    limit?: number;
  };

  export type FindManyInput<
    T extends Database.Schema,
    S extends AnyObject,
    I extends Database.Indexes,
    R extends RelationMetadata,
    C extends boolean
  > = {
    count?: C;
    select: StrictSelectInput<T, S, R>;
    include?: StrictIncludeInput<S, R>;
    where?: WhereInput<T, {}, R>;
    order?: OrderInput<I>;
    cursor?: number | string;
    limit?: number;
  };

  export type DeleteManyInput<T extends Database.Schema, S extends AnyObject, R extends RelationMetadata> = {
    select?: StrictSelectInput<T, S, R>;
    include?: StrictIncludeInput<S, R>;
    where?: WhereInput<T, {}, R>;
    limit?: number;
  };

  export type CountInput<T extends Database.Schema, R extends RelationMetadata> = {
    where?: WhereInput<T, {}, R>;
  };

  export type InsertOneResult<T extends Database.Schema, S extends AnyObject, R extends RelationMetadata> = S extends never
    ? void
    : Record<T, S, R>;

  export type UpdateOneResult<T extends Database.Schema, S extends AnyObject, R extends RelationMetadata> = S extends never
    ? void
    : Record<T, S, R> | undefined;

  export type FindOneResult<T extends Database.Schema, S extends AnyObject, R extends RelationMetadata> = S extends never
    ? void
    : Record<T, S, R> | undefined;

  export type UpsertOneResult<T extends Database.Schema, S extends AnyObject, R extends RelationMetadata> = S extends never
    ? void
    : Record<T, S, R>;

  export type DeleteOneResult<T extends Database.Schema, S extends AnyObject, R extends RelationMetadata> = S extends never
    ? void
    : Record<T, S, R> | undefined;

  export type UpdateManyResult<T extends Database.Schema, S extends AnyObject, R extends RelationMetadata> = S extends never
    ? void
    : Record<T, S, R>[];

  export type InsertManyResult = void;

  export type FindManyResult<
    T extends Database.Schema,
    S extends Database.Schema,
    R extends RelationMetadata,
    C extends boolean
  > = C extends true
    ? { records: Record<T, S, R>[]; cursor?: number | string; total: number }
    : { records: Record<T, S, R>[]; cursor?: number | string };

  export type DeleteManyResult<T extends Database.Schema, S extends AnyObject, R extends RelationMetadata> = Record<T, S, R>[];

  export type Record<T extends Database.Schema, S extends AnyObject, R extends RelationMetadata> = S extends never
    ? undefined
    : PartialObject<SelectFields<T, R>, S, false>;

  export type SelectInput<T extends Database.Schema, R extends RelationMetadata> = PartialProperties<SelectFields<T, R>>;

  export type StrictSelectInput<T extends Database.Schema, S extends AnyObject, R extends RelationMetadata> = StrictObject<
    S,
    FlatObject<SelectFields<T, R>>
  >;

  export type InsertDataInput<T extends Database.Schema, R extends RelationMetadata> = Omit<
    IsObjectEmpty<R['changes']> extends true ? T : T & R['changes'],
    IndexFields<R>
  >;

  export type UpdateDataInput<T extends Database.Schema, R extends RelationMetadata> = AtomicDataInput<
    Omit<IsObjectEmpty<R['changes']> extends true ? T : T & FlatObject<R['changes']>, IndexFields<R>>
  >;

  export type StrictIncludeInput<S extends AnyObject, R extends RelationMetadata> =
    IsObjectEmpty<R['filters']> extends false
      ? { [P in keyof IncludeFilters<R['filters'], S>]: { where?: IncludeFilters<R['filters'], S>[P] } }
      : never;

  export type OrderInput<I extends Database.Indexes> = {
    [P in DecomposeIndexName<keyof I>]?: Order;
  };

  export type WhereInput<T extends Database.Schema, I extends Database.Indexes, R extends RelationMetadata> = WhereInputFilters<T, I, R> & {
    NOT?: WhereInput<T, {}, R>;
    AND?: WhereInput<T, {}, R>[];
    OR?: WhereInput<T, {}, R>[];
  };

  type IndexFields<R extends RelationMetadata> = string extends R['indexes'] ? never : R['indexes'];

  type SelectFields<T extends Database.Schema, R extends RelationMetadata> =
    IsObjectEmpty<R['selects']> extends true ? T : T & R['selects'];

  type IncludeFilters<T extends AnyObject, S extends AnyObject> = {
    [P in keyof T]?: P extends keyof S ? (IsObject<T[P]> extends true ? null | WhereRelationField<NonNullable<T[P]>> : never) : never;
  };

  type WhereOperations<T> =
    | WhereNegate<T>
    | WhereEqual<T>
    | WhereGreaterThan<T>
    | WhereGreaterThanOrEqual<T>
    | WhereLessThan<T>
    | WhereLessThanOrEqual<T>
    | WhereIn<T>
    | WhereBetween<T>
    | WhereIsMissing
    | WhereIsNull
    | WhereStartsWith
    | WhereContains<T>;

  type WhereField<T> =
    IsObject<T> extends false
      ? T | WhereOperations<T>
      : IsNullable<T> extends true
        ? null | WhereObjectField<NonNullable<T>>
        : WhereObjectField<NonNullable<T>>;

  type WhereObjectField<T extends AnyObject> = {
    [P in keyof T]?: WhereField<T[P]>;
  };

  type WhereRelationField<T extends AnyObject> = WhereObjectField<T> & {
    NOT?: WhereRelationField<T>;
    AND?: WhereRelationField<T>[];
    OR?: WhereRelationField<T>[];
  };

  type WhereRelationFilters<T extends AnyObject> = {
    [P in keyof T]?: IsObject<T[P]> extends true
      ? IsObjectEmpty<T[P]> extends false
        ? null | WhereRelationField<T[P]>
        : null | {}
      : never;
  };

  type WhereIndexFields<I extends Database.Indexes> = PrimaryIndexes<I> & UniqueIndexes<I>;

  type WhereRequiredFilters<T extends AnyObject, I extends Database.Indexes> = {
    [P in keyof WhereIndexFields<I>]: { [N in DecomposeIndexName<P>]: T[N] };
  }[keyof WhereIndexFields<I>];

  type WhereOptionalFilters<T extends AnyObject, I extends Database.Indexes> = {
    [P in Exclude<keyof T, keyof WhereIndexFields<I>>]?: WhereField<T[P]>;
  };

  type WhereCommonFilters<T extends AnyObject, I extends Database.Indexes> =
    IsObjectEmpty<I> extends true ? WhereObjectField<T> : WhereRequiredFilters<T, I> & WhereOptionalFilters<T, I>;

  type WhereInputFilters<T extends Database.Schema, I extends Database.Indexes, R extends RelationMetadata> = WhereCommonFilters<T, I> &
    WhereRelationFilters<R['filters']>;

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
    WhereStartsWith &
    WhereContains<any>);

  type WhereNegate<T> = {
    not: T | WhereOperations<T>;
  };

  type WhereEqual<T> = {
    equal: T;
  };

  type WhereGreaterThan<T> = {
    gt: T;
  };

  type WhereGreaterThanOrEqual<T> = {
    gte: T;
  };

  type WhereLessThan<T> = {
    lt: T;
  };

  type WhereLessThanOrEqual<T> = {
    lte: T;
  };

  type WhereIn<T> = {
    isIn: IsArray<T> extends true ? T : IsObject<T> extends true ? T : T[];
  };

  type WhereBetween<T> = {
    isBetween: [T, T];
  };

  type WhereIsMissing = {
    isMissing: boolean;
  };

  type WhereIsNull = {
    isNull: boolean;
  };

  type WhereStartsWith = {
    startsWith: string;
  };

  type WhereContains<T> = {
    contains: IsObject<T> extends true ? Partial<T> : T;
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
