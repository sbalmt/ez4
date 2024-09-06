import type { AnyObject, PartialProperties, PartialObject, DeepPartial } from '@ez4/utils';
import type { TableSchemas } from './helpers.js';
import type { Database } from './database.js';

/**
 * Database client.
 */
export type Client<T extends Database.Service<any>> = ClientTables<T> & {
  /**
   * Prepare and execute the given query.
   *
   * @param query Query statement.
   * @param values Optional values to prepare the query.
   * @returns Returns the results for the given query.
   */
  rawQuery(query: string, values?: unknown[]): Promise<Record<string, unknown>[]>;
};

export type ClientTables<T extends Database.Service<any>> = {
  [P in keyof TableSchemas<T>]: TableSchemas<T>[P] extends Database.Schema
    ? Table<TableSchemas<T>[P]>
    : never;
};

export interface Table<T extends Database.Schema> {
  insertOne(query: Query.InsertOneInput<T>): Promise<Query.InsertOneResult>;

  updateOne<U extends Query.SelectInput<T>>(
    query: Query.UpdateOneInput<T, U>
  ): Promise<Query.UpdateOneResult<T, U>>;

  findOne<U extends Query.SelectInput<T>>(
    query: Query.FindOneInput<T, U>
  ): Promise<Query.FindOneResult<T, U>>;

  upsertOne<U extends Query.SelectInput<T>>(
    query: Query.UpsertOneInput<T, U>
  ): Promise<Query.UpsertOneResult<T, U>>;

  deleteOne<U extends Query.SelectInput<T>>(
    query: Query.DeleteOneInput<T, U>
  ): Promise<Query.DeleteOneResult<T, U>>;

  insertMany(query: Query.InsertManyInput<T>): Promise<Query.InsertManyResult>;

  updateMany<U extends Query.SelectInput<T>>(
    query: Query.UpdateManyInput<T, U>
  ): Promise<Query.UpdateManyResult<T, U>>;

  findMany<U extends Query.SelectInput<T>>(
    query: Query.FindManyInput<T, U>
  ): Promise<Query.FindManyResult<T, U>>;

  deleteMany<U extends Query.SelectInput<T>>(
    query: Query.DeleteManyInput<T, U>
  ): Promise<Query.DeleteManyResult<T, U>>;
}

export namespace Query {
  export type InsertOneInput<T extends Database.Schema> = {
    data: T;
  };

  export type UpdateOneInput<T extends Database.Schema, S extends Database.Schema> = {
    select?: S;
    data: DeepPartial<T>;
    where: WhereInput<T>;
  };

  export type FindOneInput<T extends Database.Schema, S extends Database.Schema> = {
    select: S;
    where: WhereInput<T>;
  };

  export type UpsertOneInput<T extends Database.Schema, S extends Database.Schema> = {
    select?: S;
    insert: T;
    update: DeepPartial<T>;
    where: WhereInput<T>;
  };

  export type DeleteOneInput<T extends Database.Schema, S extends Database.Schema> = {
    select?: S;
    where: WhereInput<T>;
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

  export type WhereInput<T extends Database.Schema> = WhereFields<T> &
    WhereNot<T> &
    WhereAnd<T> &
    WhereOr<T>;

  export type WhereFields<T extends Database.Schema> = {
    [P in keyof T]?: T[P] extends AnyObject ? WhereFields<T[P]> : T[P] | WhereOperations<T[P]>;
  };

  export type WhereNot<T extends Database.Schema> = {
    NOT?: WhereInput<T> | WhereAnd<T> | WhereOr<T>;
  };

  export type WhereAnd<T extends Database.Schema> = {
    AND?: (WhereInput<T> | WhereOr<T> | WhereNot<T>)[];
  };

  export type WhereOr<T extends Database.Schema> = {
    OR?: (WhereInput<T> | WhereAnd<T> | WhereNot<T>)[];
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
