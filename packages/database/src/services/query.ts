import type { Relations } from './relations.js';
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
  IsNullable,
  IsObject,
  StrictType
} from '@ez4/utils';

/**
 * Query builder types.
 */
export namespace Query {
  export type InsertOneInput<T extends Database.Schema, R extends Relations> = {
    data: Omit<T, R['indexes']> & R['changes'];
  };

  export type UpdateOneInput<
    T extends Database.Schema,
    S extends Database.Schema,
    I extends Database.Indexes<T>,
    R extends Relations
  > = {
    select?: StrictType<SelectInput<T, R>, S>;
    data: DeepPartial<Omit<T, R['indexes']> & FlatObject<R['changes']>>;
    where: WhereInput<T, I, R>;
  };

  export type FindOneInput<
    T extends Database.Schema,
    S extends Database.Schema,
    I extends Database.Indexes<T>,
    R extends Relations
  > = {
    select: StrictType<SelectInput<T, R>, S>;
    where: WhereInput<T, I, R>;
  };

  export type UpsertOneInput<
    T extends Database.Schema,
    S extends Database.Schema,
    I extends Database.Indexes<T>,
    R extends Relations
  > = {
    select?: StrictType<SelectInput<T, R>, S>;
    insert: Omit<T, R['indexes']> & R['changes'];
    update: DeepPartial<Omit<T, R['indexes']> & FlatObject<R['changes']>>;
    where: WhereInput<T, I, R>;
  };

  export type DeleteOneInput<
    T extends Database.Schema,
    S extends Database.Schema,
    I extends Database.Indexes<T>,
    R extends Relations
  > = {
    select?: StrictType<SelectInput<T, R>, S>;
    where: WhereInput<T, I, R>;
  };

  export type InsertManyInput<T extends Database.Schema> = {
    data: T[];
  };

  export type UpdateManyInput<
    T extends Database.Schema,
    S extends Database.Schema,
    R extends Relations
  > = {
    select?: StrictType<SelectInput<T, R>, S>;
    data: DeepPartial<Omit<T, R['indexes']> & FlatObject<R['changes']>>;
    where?: WhereInput<T, {}, R>;
    limit?: number;
  };

  export type FindManyInput<
    T extends Database.Schema,
    S extends Database.Schema,
    I extends Database.Indexes<T>,
    R extends Relations
  > = {
    select: StrictType<SelectInput<T, R>, S>;
    where?: WhereInput<T, {}, R>;
    order?: OrderInput<I>;
    cursor?: number | string;
    limit?: number;
  };

  export type DeleteManyInput<
    T extends Database.Schema,
    S extends Database.Schema,
    R extends Relations
  > = {
    select?: StrictType<SelectInput<T, R>, S>;
    where?: WhereInput<T, {}, R>;
    limit?: number;
  };

  export type InsertOneResult = void;

  export type UpdateOneResult<
    T extends Database.Schema,
    S extends AnyObject,
    R extends Relations
  > = Record<T, S, R> | undefined;

  export type FindOneResult<T extends Database.Schema, S extends AnyObject, R extends Relations> =
    | Record<T, S, R>
    | undefined;

  export type UpsertOneResult<
    T extends Database.Schema,
    S extends AnyObject,
    R extends Relations
  > = Record<T, S, R> | undefined;

  export type DeleteOneResult<
    T extends Database.Schema,
    S extends AnyObject,
    R extends Relations
  > = Record<T, S, R> | undefined;

  export type InsertManyResult = void;

  export type UpdateManyResult<
    T extends Database.Schema,
    S extends AnyObject,
    R extends Relations
  > = Record<T, S, R>[];

  export type FindManyResult<
    T extends Database.Schema,
    S extends AnyObject,
    R extends Relations
  > = {
    records: Record<T, S, R>[];
    cursor?: number | string;
  };

  export type DeleteManyResult<
    T extends Database.Schema,
    S extends AnyObject,
    R extends Relations
  > = Record<T, S, R>[];

  export type Record<
    T extends Database.Schema,
    S extends AnyObject,
    R extends Relations
  > = PartialObject<T & R['selects'], S, false>;

  export type SelectInput<T extends Database.Schema, R extends Relations> = PartialProperties<
    T & R['selects']
  >;

  export type OrderInput<I extends Database.Indexes> = {
    [P in DecomposeIndexName<keyof I>]?: Order;
  };

  export type WhereInput<
    T extends Database.Schema,
    I extends Database.Indexes<T>,
    R extends Relations
  > = WhereFields<T & R['filters'], I> & WhereNot<T, I, R> & WhereAnd<T, I, R> & WhereOr<T, I, R>;

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

  type WhereRequiredFields<
    T extends Database.Schema,
    I extends Database.Indexes<T>,
    N extends string
  > = {
    [P in N]: P extends keyof T
      ? IsObject<T[P]> extends true
        ? IsNullable<T[P]> extends true
          ? null | WhereFields<NonNullable<T[P]>, I>
          : WhereFields<NonNullable<T[P]>, I>
        : T[P] | WhereOperations<T[P]>
      : never;
  };

  type WhereOptionalFields<
    T extends Database.Schema,
    I extends Database.Indexes<T>,
    N extends string
  > = {
    [P in Exclude<keyof T, N>]?: IsObject<T[P]> extends true
      ? IsNullable<T[P]> extends true
        ? null | WhereFields<NonNullable<T[P]>, I>
        : WhereFields<NonNullable<T[P]>, I>
      : T[P] | WhereOperations<T[P]>;
  };

  type WhereFields<T extends Database.Schema, I extends Database.Indexes<T>> =
    | (WhereRequiredFields<T, I, DecomposePrimaryIndexNames<I>> &
        WhereOptionalFields<T, I, DecomposePrimaryIndexNames<I>>)
    | (WhereRequiredFields<T, I, DecomposeUniqueIndexNames<I>> &
        WhereOptionalFields<T, I, DecomposeUniqueIndexNames<I>>);

  type WhereNot<T extends Database.Schema, I extends Database.Indexes<T>, R extends Relations> = {
    NOT?: WhereInput<T, I, R> | WhereAnd<T, I, R> | WhereOr<T, I, R>;
  };

  type WhereAnd<T extends Database.Schema, I extends Database.Indexes<T>, R extends Relations> = {
    AND?: (WhereInput<T, I, R> | WhereOr<T, I, R> | WhereNot<T, I, R>)[];
  };

  type WhereOr<T extends Database.Schema, I extends Database.Indexes<T>, R extends Relations> = {
    OR?: (WhereInput<T, I, R> | WhereAnd<T, I, R> | WhereNot<T, I, R>)[];
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
