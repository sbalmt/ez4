import type { DecomposeIndexName, PrimaryIndexes, UniqueIndexes } from './indexes.js';
import type { RelationMetadata } from './relations.js';
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

  export type UpdateManyInput<S extends AnyObject, T extends TableMetadata> = PaginationUtils.End<T> & {
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    data: OptionalObject<UpdateDataInput<T>>;
    where?: WhereInput<T>;
  };

  export type FindManyInput<S extends AnyObject, T extends TableMetadata, C extends boolean> = PaginationUtils.Range<T> & {
    count?: C;
    select: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    where?: WhereInput<T>;
    order?: OrderInput<T>;
  };

  export type DeleteManyInput<S extends AnyObject, T extends TableMetadata> = PaginationUtils.End<T> & {
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

  export type StrictIncludeInput<S extends AnyObject, T extends TableMetadata> =
    IsObjectEmpty<T['relations']['filters']> extends true
      ? never
      : {
          [P in keyof IncludeFilters<T['relations']['filters'], S>]: PaginationUtils.Range<T> & {
            where?: IncludeFilters<T['relations']['filters'], S>[P];
            order?: OrderInput<T, T['relations']['filters'][P]>;
          };
        };

  export type WhereInput<T extends TableMetadata, I extends boolean = false> = WhereInputFilters<
    T['schema'],
    I extends true ? T['indexes'] : {},
    T['relations']
  > & {
    NOT?: WhereInput<T>;
    AND?: WhereInput<T>[];
    OR?: WhereInput<T>[];
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
