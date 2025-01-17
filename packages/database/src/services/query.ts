import type { RelationMetadata } from './relations.js';
import type { Database } from './database.js';
import type { Order } from './order.js';

import type {
  DecomposeIndexName,
  DecomposePrimaryIndexNames,
  DecomposeUniqueIndexNames
} from './indexes.js';

import type {
  AnyObject,
  PartialProperties,
  PartialObject,
  DeepPartial,
  FlatObject,
  StrictType,
  IsNullable,
  IsObjectEmpty,
  IsObject
} from '@ez4/utils';

/**
 * Query builder types.
 */
export namespace Query {
  export type InsertOneInput<T extends Database.Schema, R extends RelationMetadata> = {
    data: Omit<T, R['indexes']> & R['changes'];
  };

  export type UpdateOneInput<
    T extends Database.Schema,
    S extends AnyObject,
    I extends Database.Indexes<T>,
    R extends RelationMetadata
  > = {
    select?: StrictSelectInput<T, S, R>;
    include?: StrictIncludeInput<S, R>;
    data: DeepPartial<Omit<T, R['indexes']> & FlatObject<R['changes']>>;
    where: WhereInput<T, I, R>;
  };

  export type FindOneInput<
    T extends Database.Schema,
    S extends AnyObject,
    I extends Database.Indexes<T>,
    R extends RelationMetadata
  > = {
    select: StrictSelectInput<T, S, R>;
    include?: StrictIncludeInput<S, R>;
    where: WhereInput<T, I, R>;
  };

  export type UpsertOneInput<
    T extends Database.Schema,
    S extends AnyObject,
    I extends Database.Indexes<T>,
    R extends RelationMetadata
  > = {
    select?: StrictSelectInput<T, S, R>;
    include?: StrictIncludeInput<S, R>;
    insert: Omit<T, R['indexes']> & R['changes'];
    update: DeepPartial<Omit<T, R['indexes']> & FlatObject<R['changes']>>;
    where: WhereInput<T, I, R>;
  };

  export type DeleteOneInput<
    T extends Database.Schema,
    S extends AnyObject,
    I extends Database.Indexes<T>,
    R extends RelationMetadata
  > = {
    select?: StrictSelectInput<T, S, R>;
    include?: StrictIncludeInput<S, R>;
    where: WhereInput<T, I, R>;
  };

  export type InsertManyInput<T extends Database.Schema = {}> = {
    data: T[];
  };

  export type UpdateManyInput<
    T extends Database.Schema,
    S extends AnyObject,
    R extends RelationMetadata
  > = {
    select?: StrictSelectInput<T, S, R>;
    include?: StrictIncludeInput<S, R>;
    data: DeepPartial<Omit<T, R['indexes']> & FlatObject<R['changes']>>;
    where?: WhereInput<T, {}, R>;
    limit?: number;
  };

  export type FindManyInput<
    T extends Database.Schema,
    S extends AnyObject,
    I extends Database.Indexes<T>,
    R extends RelationMetadata
  > = {
    select: StrictSelectInput<T, S, R>;
    include?: StrictIncludeInput<S, R>;
    where?: WhereInput<T, {}, R>;
    order?: OrderInput<I>;
    cursor?: number | string;
    limit?: number;
  };

  export type DeleteManyInput<
    T extends Database.Schema,
    S extends AnyObject,
    R extends RelationMetadata
  > = {
    select?: StrictSelectInput<T, S, R>;
    include?: StrictIncludeInput<S, R>;
    where?: WhereInput<T, {}, R>;
    limit?: number;
  };

  export type InsertOneResult = void;

  export type UpdateOneResult<
    T extends Database.Schema,
    S extends AnyObject,
    R extends RelationMetadata
  > = Record<T, S, R> | undefined;

  export type FindOneResult<
    T extends Database.Schema,
    S extends AnyObject,
    R extends RelationMetadata
  > = Record<T, S, R> | undefined;

  export type UpsertOneResult<
    T extends Database.Schema,
    S extends AnyObject,
    R extends RelationMetadata
  > = Record<T, S, R> | undefined;

  export type DeleteOneResult<
    T extends Database.Schema,
    S extends AnyObject,
    R extends RelationMetadata
  > = Record<T, S, R> | undefined;

  export type InsertManyResult = void;

  export type UpdateManyResult<
    T extends Database.Schema,
    S extends AnyObject,
    R extends RelationMetadata
  > = Record<T, S, R>[];

  export type FindManyResult<
    T extends Database.Schema,
    S extends Database.Schema,
    R extends RelationMetadata
  > = {
    records: Record<T, S, R>[];
    cursor?: number | string;
  };

  export type DeleteManyResult<
    T extends Database.Schema,
    S extends AnyObject,
    R extends RelationMetadata
  > = Record<T, S, R>[];

  export type Record<
    T extends Database.Schema,
    S extends AnyObject,
    R extends RelationMetadata
  > = PartialObject<T & R['selects'], S, false>;

  export type SelectInput<
    T extends Database.Schema,
    R extends RelationMetadata
  > = PartialProperties<T & R['selects']>;

  export type StrictSelectInput<
    T extends Database.Schema,
    S extends AnyObject,
    R extends RelationMetadata
  > = StrictType<S, FlatObject<T & R['selects']>>;

  export type OrderInput<I extends Database.Indexes> = {
    [P in DecomposeIndexName<keyof I>]?: Order;
  };

  export type StrictIncludeInput<
    S extends AnyObject,
    R extends RelationMetadata
  > = WhereIncludeFilters<R['filters'], S>;

  export type WhereInput<
    T extends Database.Schema,
    I extends Database.Indexes<T>,
    R extends RelationMetadata
  > = WhereInputFilters<T, I, R> &
    WhereNot<WhereInputFilters<T, I, R>> &
    WhereAnd<WhereInputFilters<T, I, R>> &
    WhereOr<WhereInputFilters<T, I, R>>;

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
    WhereContains);

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
    | WhereContains;

  type WhereField<T> =
    IsObject<T> extends false
      ? T | WhereOperations<T>
      : IsNullable<T> extends true
        ? null | WhereObjectField<NonNullable<T>>
        : WhereObjectField<NonNullable<T>>;

  type WhereObjectField<T extends AnyObject> = {
    [P in keyof T]?: WhereField<T[P]>;
  };

  type WhereRelationField<T extends AnyObject> = WhereObjectField<T> &
    WhereNot<WhereObjectField<T>> &
    WhereAnd<WhereObjectField<T>> &
    WhereOr<WhereObjectField<T>>;

  type WhereRelationFilters<T extends AnyObject> = {
    [P in keyof T]?: IsObject<T[P]> extends true
      ? IsObjectEmpty<T[P]> extends false
        ? null | WhereRelationField<NonNullable<T[P]>>
        : null | {}
      : never;
  };

  type WhereRequiredFilters<T extends AnyObject, N extends string> = {
    [P in N as P extends keyof T ? P : never]: P extends keyof T ? WhereField<T[P]> : never;
  };

  type WhereOptionalFilters<T extends AnyObject, N extends string> = {
    [P in Exclude<keyof T, N>]?: WhereField<T[P]>;
  };

  type WhereCommonFilters<T extends AnyObject, I extends Database.Indexes<T>> =
    | (WhereRequiredFilters<T, DecomposePrimaryIndexNames<I>> &
        WhereOptionalFilters<T, DecomposePrimaryIndexNames<I>>)
    | (WhereRequiredFilters<T, DecomposeUniqueIndexNames<I>> &
        WhereOptionalFilters<T, DecomposeUniqueIndexNames<I>>);

  type WhereInputFilters<
    T extends Database.Schema,
    I extends Database.Indexes<T>,
    R extends RelationMetadata
  > = WhereCommonFilters<T, I> & WhereRelationFilters<R['filters']>;

  type WhereIncludeFilters<T extends AnyObject, S extends AnyObject> = {
    [P in keyof T]?: P extends keyof S
      ? IsObject<T[P]> extends true
        ? WhereRelationField<NonNullable<T[P]>>
        : never
      : never;
  };

  type WhereNot<T extends AnyObject> = {
    NOT?: T | WhereAnd<T> | WhereOr<T>;
  };

  type WhereAnd<T extends AnyObject> = {
    AND?: (T | WhereNot<T> | WhereAnd<T> | WhereOr<T>)[];
  };

  type WhereOr<T extends AnyObject> = {
    OR?: (T | WhereNot<T> | WhereAnd<T> | WhereOr<T>)[];
  };

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
    isIn: T[];
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

  type WhereContains = {
    contains: string;
  };
}
