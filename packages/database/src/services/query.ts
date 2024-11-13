import type { DecomposeIndexName, PrimaryIndexes } from './indexes.js';
import type { Relations } from './relations.js';
import type { Database } from './database.js';
import type { Order } from './order.js';

import type {
  AnyObject,
  PartialProperties,
  PartialObject,
  DeepPartial,
  FlatObject,
  IsObject
} from '@ez4/utils';

/**
 * Query builder types.
 */
export namespace Query {
  export type InsertOneInput<
    T extends Database.Schema,
    I extends Database.Indexes<T>,
    R extends Relations
  > = {
    data: T | (Omit<T, DecomposeIndexName<keyof I>> & R);
  };

  export type UpdateOneInput<
    T extends Database.Schema,
    S extends Database.Schema,
    I extends Database.Indexes<T>,
    R extends Relations
  > = {
    select?: S;
    data: DeepPartial<T | FlatObject<Omit<T, DecomposeIndexName<keyof I>> & R>>;
    where: WhereInput<T, I>;
  };

  export type FindOneInput<
    T extends Database.Schema,
    S extends Database.Schema,
    I extends Database.Indexes<T>
  > = {
    select: S;
    where: WhereInput<T, I>;
  };

  export type UpsertOneInput<
    T extends Database.Schema,
    S extends Database.Schema,
    I extends Database.Indexes<T>
  > = {
    select?: S;
    insert: T;
    update: DeepPartial<T>;
    where: WhereInput<T, I>;
  };

  export type DeleteOneInput<
    T extends Database.Schema,
    S extends Database.Schema,
    I extends Database.Indexes<T>
  > = {
    select?: S;
    where: WhereInput<T, I>;
  };

  export type InsertManyInput<T extends Database.Schema> = {
    data: T[];
  };

  export type UpdateManyInput<T extends Database.Schema, S extends Database.Schema> = {
    select?: S;
    data: DeepPartial<T>;
    where?: WhereInput<T>;
    limit?: number;
  };

  export type FindManyInput<
    T extends Database.Schema,
    S extends Database.Schema,
    I extends Database.Indexes<T>
  > = {
    select: S;
    where?: WhereInput<T>;
    order?: OrderInput<I>;
    cursor?: number | string;
    limit?: number;
  };

  export type DeleteManyInput<T extends Database.Schema, S extends Database.Schema> = {
    select?: S;
    where?: WhereInput<T>;
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
  > = PartialObject<T & R, S, false>;

  export type SelectInput<T extends Database.Schema, R extends Relations> = PartialProperties<
    T & R
  >;

  export type OrderInput<I extends Database.Indexes> = {
    [P in DecomposeIndexName<keyof I>]?: Order;
  };

  export type WhereInput<
    T extends Database.Schema,
    I extends Database.Indexes<T> = {}
  > = WhereFields<T, I> & WhereNot<T, I> & WhereAnd<T, I> & WhereOr<T, I>;

  export type WhereRequiredFields<T extends Database.Schema, I extends Database.Indexes<T>> = {
    [P in DecomposeIndexName<keyof PrimaryIndexes<I>>]: P extends keyof T
      ? IsObject<T[P]> extends true
        ? WhereFields<NonNullable<T[P]>, I>
        : T[P] | WhereOperations<T[P]>
      : never;
  };

  export type WhereOptionalFields<T extends Database.Schema, I extends Database.Indexes<T>> = {
    [P in Exclude<keyof T, DecomposeIndexName<keyof PrimaryIndexes<I>>>]?: IsObject<
      T[P]
    > extends true
      ? WhereFields<NonNullable<T[P]>, I>
      : T[P] | WhereOperations<T[P]>;
  };

  export type WhereFields<
    T extends Database.Schema,
    I extends Database.Indexes<T>
  > = WhereRequiredFields<T, I> & WhereOptionalFields<T, I>;

  export type WhereNot<T extends Database.Schema, I extends Database.Indexes<T>> = {
    NOT?: WhereInput<T, I> | WhereAnd<T, I> | WhereOr<T, I>;
  };

  export type WhereAnd<T extends Database.Schema, I extends Database.Indexes<T>> = {
    AND?: (WhereInput<T, I> | WhereOr<T, I> | WhereNot<T, I>)[];
  };

  export type WhereOr<T extends Database.Schema, I extends Database.Indexes<T>> = {
    OR?: (WhereInput<T, I> | WhereAnd<T, I> | WhereNot<T, I>)[];
  };

  export type WhereOperations<T> =
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

  export type WhereNegate<T> = {
    not: T | WhereOperations<T>;
  };

  export type WhereEqual<T> = {
    equal: T;
  };

  export type WhereGreaterThan<T> = {
    gt: T;
  };

  export type WhereGreaterThanOrEqual<T> = {
    gte: T;
  };

  export type WhereLessThan<T> = {
    lt: T;
  };

  export type WhereLessThanOrEqual<T> = {
    lte: T;
  };

  export type WhereIn<T> = {
    isIn: T[];
  };

  export type WhereBetween<T> = {
    isBetween: [T, T];
  };

  export type WhereIsMissing = {
    isMissing: boolean;
  };

  export type WhereIsNull = {
    isNull: boolean;
  };

  export type WhereStartsWith = {
    startsWith: string;
  };

  export type WhereContains = {
    contains: string;
  };
}
