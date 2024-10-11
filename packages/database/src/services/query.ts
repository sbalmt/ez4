import type { AnyObject, PartialProperties, PartialObject, DeepPartial } from '@ez4/utils';
import type { Database } from './database.js';

/**
 * Query builder types.
 */
export namespace Query {
  export type InsertOneInput<T extends Database.Schema> = {
    data: T;
  };

  export type UpdateOneInput<
    T extends Database.Schema,
    S extends Database.Schema,
    I extends string | never
  > = {
    select?: S;
    data: DeepPartial<T>;
    where: WhereInput<T, I>;
  };

  export type FindOneInput<
    T extends Database.Schema,
    S extends Database.Schema,
    I extends string | never
  > = {
    select: S;
    where: WhereInput<T, I>;
  };

  export type UpsertOneInput<
    T extends Database.Schema,
    S extends Database.Schema,
    I extends string | never
  > = {
    select?: S;
    insert: T;
    update: DeepPartial<T>;
    where: WhereInput<T, I>;
  };

  export type DeleteOneInput<
    T extends Database.Schema,
    S extends Database.Schema,
    I extends string | never
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

  export type FindManyInput<T extends Database.Schema, S extends Database.Schema> = {
    select: S;
    where?: WhereInput<T>;
    cursor?: number | string;
    limit?: number;
  };

  export type DeleteManyInput<T extends Database.Schema, S extends Database.Schema> = {
    select?: S;
    where?: WhereInput<T>;
    limit?: number;
  };

  export type InsertOneResult = void;

  export type UpdateOneResult<T extends Database.Schema, S extends AnyObject> =
    | FindOneResult<T, S>
    | undefined;

  export type FindOneResult<T extends Database.Schema, S extends AnyObject> =
    | Record<T, S>
    | undefined;

  export type UpsertOneResult<T extends Database.Schema, S extends AnyObject> =
    | FindOneResult<T, S>
    | undefined;

  export type DeleteOneResult<T extends Database.Schema, S extends AnyObject> =
    | FindOneResult<T, S>
    | undefined;

  export type InsertManyResult = void;

  export type UpdateManyResult<T extends Database.Schema, S extends AnyObject> = Record<T, S>[];

  export type FindManyResult<T extends Database.Schema, S extends AnyObject> = {
    records: Record<T, S>[];
    cursor?: number | string;
  };

  export type DeleteManyResult<T extends Database.Schema, S extends AnyObject> = Record<T, S>[];

  export type Record<T extends Database.Schema, S extends AnyObject> = PartialObject<T, S, false>;

  export type SelectInput<T extends Database.Schema> = PartialProperties<T>;

  export type WhereInput<T extends Database.Schema, I extends string | never = never> = WhereFields<
    T,
    I
  > &
    WhereNot<T, I> &
    WhereAnd<T, I> &
    WhereOr<T, I>;

  export type WhereRequiredFields<T extends Database.Schema, I extends string | never> = {
    [P in I]: P extends keyof T
      ? T[P] extends AnyObject
        ? WhereFields<T[P], I>
        : T[P] | WhereOperations<T[P]>
      : never;
  };

  export type WhereOptionalFields<T extends Database.Schema, I extends string | never> = {
    [P in Exclude<keyof T, I>]?: T[P] extends AnyObject
      ? WhereFields<T[P], I>
      : T[P] | WhereOperations<T[P]>;
  };

  export type WhereFields<
    T extends Database.Schema,
    I extends string | never
  > = WhereRequiredFields<T, I> & WhereOptionalFields<T, I>;

  export type WhereNot<T extends Database.Schema, I extends string | never> = {
    NOT?: WhereInput<T, I> | WhereAnd<T, I> | WhereOr<T, I>;
  };

  export type WhereAnd<T extends Database.Schema, I extends string | never> = {
    AND?: (WhereInput<T, I> | WhereOr<T, I> | WhereNot<T, I>)[];
  };

  export type WhereOr<T extends Database.Schema, I extends string | never> = {
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
