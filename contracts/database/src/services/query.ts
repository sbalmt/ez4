import type { AnyObject, PartialProperties, PartialObject, StrictObject, IsObjectEmpty, Prettify, IsTrue } from '@ez4/utils';
import type { AtomicFields } from './query/atomic';
import type { WhereFieldInput, WhereRelationInput } from './query/where';
import type { DatabaseEngine } from './engine';
import type { UndefinedModeUtils } from './undefined';
import type { PaginationModeUtils } from './pagination';
import type { RelationMetadata } from './relations';
import type { OrderModeUtils } from './order';
import type { LockModeUtils } from './lock';
import type { TableMetadata } from './table';
import type { Database } from './contract';

/**
 * Query builder types.
 */
export namespace Query {
  export type InsertOneInput<S extends AnyObject, T extends TableMetadata> = {
    select?: StrictSelectInput<S, T>;
    data: Prettify<InsertDataInput<T>>;
  };

  export type UpdateOneInput<S extends AnyObject, T extends TableMetadata> = {
    lock?: LockModeUtils.Input<T>;
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    data: Prettify<UpdateDataInput<T>>;
    where: WhereInput<T, true>;
  };

  export type FindOneInput<S extends AnyObject, T extends TableMetadata> = {
    lock?: LockModeUtils.Input<T>;
    select: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    where: WhereInput<T, true>;
  };

  export type UpsertOneInput<S extends AnyObject, T extends TableMetadata> = {
    lock?: LockModeUtils.Input<T>;
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    update: Prettify<UpdateDataInput<T>>;
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

  export type UpdateManyInput<S extends AnyObject, T extends TableMetadata> = PaginationModeUtils.End<T['engine']> & {
    lock?: LockModeUtils.Input<T>;
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    data: Prettify<UpdateDataInput<T>>;
    where?: WhereInput<T>;
  };

  export type FindManyInput<S extends AnyObject, C extends boolean, T extends TableMetadata> = PaginationModeUtils.Range<T['engine']> & {
    lock?: LockModeUtils.Input<T>;
    select: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    where?: WhereInput<T>;
    order?: OrderInput<T>;
    count?: C;
  };

  export type DeleteManyInput<S extends AnyObject, T extends TableMetadata> = PaginationModeUtils.End<T['engine']> & {
    select?: StrictSelectInput<S, T>;
    include?: StrictIncludeInput<S, T>;
    where?: WhereInput<T>;
  };

  export type ExistsInput<T extends TableMetadata> = {
    where?: WhereInput<T>;
  };

  export type CountInput<T extends TableMetadata> = {
    where?: WhereInput<T>;
  };

  export type InsertOneResult<S extends AnyObject, T extends TableMetadata> = SelectInput<T> extends S ? void : Record<S, T>;

  export type UpdateOneResult<S extends AnyObject, T extends TableMetadata> = SelectInput<T> extends S ? void : Record<S, T> | undefined;

  export type FindOneResult<S extends AnyObject, T extends TableMetadata> = SelectInput<T> extends S ? void : Record<S, T> | undefined;

  export type UpsertOneResult<S extends AnyObject, T extends TableMetadata> =
    SelectInput<T> extends S ? { inserted: boolean } : { inserted: boolean; record: Record<S, T> };

  export type DeleteOneResult<S extends AnyObject, T extends TableMetadata> = SelectInput<T> extends S ? void : Record<S, T> | undefined;

  export type UpdateManyResult<S extends AnyObject, T extends TableMetadata> = SelectInput<T> extends S ? void : Record<S, T>[];

  export type InsertManyResult = void;

  export type FindManyResult<S extends AnyObject, C extends boolean, T extends TableMetadata> =
    IsTrue<C> extends true ? FindManyResultTotal<S, T> : FindManyResultOnly<S, T>;

  export type FindManyResultOnly<S extends AnyObject, T extends TableMetadata> = PaginationModeUtils.Result<T['engine']> & {
    records: SelectInput<T> extends S ? void : Record<S, T>[];
  };

  export type FindManyResultTotal<S extends AnyObject, T extends TableMetadata> = PaginationModeUtils.Result<T['engine']> & {
    records: SelectInput<T> extends S ? void : Record<S, T>[];
    total: number;
  };

  export type DeleteManyResult<S extends AnyObject, T extends TableMetadata> = SelectInput<T> extends S ? void : Record<S, T>[];

  export type Record<S extends AnyObject, T extends TableMetadata> = PartialObject<
    UndefinedModeUtils.Output<SelectOutputFields<T['schema'], T['relations']>, T['engine']>,
    S
  >;

  export type SelectInput<T extends TableMetadata> = PartialProperties<SelectInputFields<T['schema'], T['relations']>>;

  export type StrictSelectInput<S extends AnyObject, T extends TableMetadata> = StrictObject<
    S,
    SelectInputFields<T['schema'], T['relations']>
  >;

  export type InsertDataInput<T extends TableMetadata> =
    IsObjectEmpty<T['relations']['inserts']> extends false
      ? Omit<T['schema'], T['relations']['indexes']> & T['relations']['inserts']
      : T['schema'];

  export type UpdateDataInput<T extends TableMetadata> =
    IsObjectEmpty<T['relations']['updates']> extends false
      ? AtomicFields<Omit<T['schema'], T['relations']['indexes']>> & T['relations']['updates']
      : AtomicFields<T['schema']>;

  export type OrderInput<T extends TableMetadata> = OrderModeUtils.Input<T>;

  export type StrictIncludeInput<S extends AnyObject, T extends TableMetadata> =
    IsObjectEmpty<T['relations']['filters']> extends true ? never : StrictIncludeRelations<S, T['relations'], T['engine']>;

  export type StrictIncludeOrder<T extends AnyObject> = OrderModeUtils.AnyInput<T>;

  export type StrictIncludeRelation<
    T extends AnyObject,
    E extends DatabaseEngine,
    R extends RelationMetadata = RelationMetadata,
    S extends AnyObject = {},
    O extends AnyObject = T
  > = PaginationModeUtils.Range<E> & {
    include?: StrictIncludeRelations<S, R, E>;
    where?: WhereRelationInput<T, E>;
    order?: StrictIncludeOrder<O>;
  };

  type StrictIncludeRelations<S extends AnyObject, R extends RelationMetadata, E extends DatabaseEngine> = {
    [P in keyof R['filters']]?: P extends keyof S
      ? StrictIncludeRelation<
          NonNullable<R['filters'][P]>,
          E,
          NonNullable<R['includes'][P]>,
          S[P] extends AnyObject ? S[P] : {},
          NonNullable<R['orders'][P]>
        >
      : never;
  };

  export type WhereInput<T extends TableMetadata, I extends boolean = false> = WhereFieldInput<T, I>;

  type SelectInputFields<T extends Database.Schema, R extends RelationMetadata> =
    IsObjectEmpty<R['selects']> extends true ? T : T & R['selects'];

  type SelectOutputFields<T extends Database.Schema, R extends RelationMetadata> =
    IsObjectEmpty<R['records']> extends true ? T : T & R['records'];
}
