import type { AnyObject, ArrayRest, PropertyType, Exclusive, IsArrayEmpty, IsUndefined, MergeObject, Prettify } from '@ez4/utils';
import type { IndexedTables, PrimaryIndexes, UniqueIndexes } from './indexes';
import type { Database, DatabaseTables } from './database';
import type { TableSchemas } from './schemas';

/**
 * Internal relation type.
 */
export type RelationMetadata = {
  filters: Record<string, AnyObject | undefined>;
  updates: Record<string, AnyObject | undefined>;
  inserts: Record<string, AnyObject | undefined>;
  selects: Record<string, AnyObject | undefined>;
  records: Record<string, AnyObject | undefined>;
  indexes: string;
};

/**
 * Given a relation source name `T`, it produces the source table name.
 */
export type RelationSourceTable<T> = T extends `${infer U}:${string}` ? U : never;

/**
 * Given a relation source name `T`, it produces the source column name.
 */
export type RelationSourceColumn<T> = T extends `${string}:${infer U}` ? U : never;

/**
 * Given a relation target name `T`, it produces the target column name.
 */
export type RelationTargetColumn<T> = T extends `${infer U}@${string}` ? U : never;

/**
 * Given a relation target name `T`, it produces the target alias name.
 */
export type RelationTargetAlias<T> = T extends `${string}@${infer U}` ? U : never;

/**
 * Given a database service `T`, it produces an object with all relation tables.
 */
export type RelationTables<T extends Database.Service> = MergeRelations<
  DatabaseTables<T>,
  DatabaseTables<T>,
  TableSchemas<T>,
  IndexedTables<T>
>;

/**
 * Given a list of tables with relations `T`, it produces an object containing all the
 * relation tables.
 */
type MergeRelations<
  T extends Database.Table[],
  C extends Database.Table[],
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>
> = IsArrayEmpty<C> extends false ? TableRelation<T, C[0], S, I> & MergeRelations<T, ArrayRest<C>, S, I> : {};

/**
 * Given a database table `T`, it produces an object containing all its relations.
 */
type TableRelation<
  T extends Database.Table[],
  C extends Database.Table,
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>
> = C extends {
  name: infer N;
}
  ? N extends string
    ? C extends { relations: infer R }
      ? R extends AnyObject
        ? {
            [P in N]: {
              indexes: RelationIndexes<N, I, R>;
              filters: FilterableRelationSchemas<S, R>;
              updates: UpdateRelationSchemas<N, S, I, R>;
              inserts: InsertRelationSchemas<N, PropertyType<N, S>, S, I, R>;
              selects: SelectRelationSchemas<S, I, R> & NestedSelectRelationSchemas<T, S, I, R>;
              records: MergeObject<RecordsRelationSchemas<PropertyType<N, S>, S, I, R>, NestedRecordsRelationSchemas<T, S, I, R>>;
            };
          }
        : {}
      : {
          [P in N]: {
            indexes: never;
            filters: {};
            updates: {};
            inserts: {};
            selects: {};
            records: {};
          };
        }
    : {}
  : {};

/**
 * Check whether the given column is a primary index.
 */
type IsPrimarySourceIndex<C, I extends Record<string, Database.Indexes>> =
  RelationSourceColumn<C> extends keyof PrimaryIndexes<PropertyType<RelationSourceTable<C>, I>> ? true : false;

/**
 * Check whether the given column is a unique index.
 */
type IsUniqueSourceIndex<C, I extends Record<string, Database.Indexes>> =
  RelationSourceColumn<C> extends keyof UniqueIndexes<PropertyType<RelationSourceTable<C>, I>> ? true : false;

/**
 * Check whether the given column is a primary target index.
 */
type IsPrimaryTargetIndex<V, I extends Database.Indexes> = RelationTargetColumn<V> extends keyof PrimaryIndexes<I> ? true : false;

/**
 * Check whether the given column is a unique target index.
 */
export type IsUniqueTargetIndex<V, I extends Database.Indexes> = RelationTargetColumn<V> extends keyof UniqueIndexes<I> ? true : false;

/**
 * Check whether the given column is a secondary target index.
 */
type IsSecondaryTargetIndex<V, I extends Database.Indexes> =
  RelationTargetColumn<V> extends keyof (PrimaryIndexes<I> & UniqueIndexes<I>) ? false : true;

/**
 * Check whether a relation is optional or not.
 */
type IsOptionalRelation<C, V, T extends Database.Schema, I extends Record<string, Database.Indexes>, E extends boolean> =
  IsPrimarySourceIndex<C, I> extends true
    ? IsUndefined<PropertyType<RelationTargetColumn<V>, T>>
    : IsUniqueSourceIndex<C, I> extends true
      ? true
      : E;

/**
 * Produce an object containing all relation indexes.
 */
type RelationIndexes<N, I extends Record<string, Database.Indexes>, R extends AnyObject> = keyof {
  [P in keyof R as IsRelationIndex<N, R[P], P, I> extends true ? RelationTargetColumn<P> : never]: never;
};

/**
 * Check whether the given source and target columns are used to index the relation.
 */
type IsRelationIndex<N, C, V, I extends Record<string, Database.Indexes>> =
  IsPrimarySourceIndex<C, I> extends false
    ? IsSecondaryTargetIndex<V, PropertyType<N, I>> extends false
      ? IsUniqueTargetIndex<V, PropertyType<N, I>> extends true
        ? IsUniqueSourceIndex<C, I>
        : false
      : true
    : true;

/**
 * Produce an object containing relation schemas for filters.
 */
type FilterableRelationSchemas<S extends Record<string, Database.Schema>, R extends AnyObject> = {
  [P in keyof R as RelationTargetAlias<P>]: Omit<PropertyType<RelationSourceTable<R[P]>, S>, RelationSourceColumn<R[P]>>;
};

/**
 * Produce an object containing relation schemas for updates.
 */
type UpdateRelationSchemas<
  N,
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>,
  R extends AnyObject
> = {
  [P in keyof R as RelationTargetAlias<P>]?: ChangeRelationSchema<N, R[P], P, S, I>;
};

/**
 * Produce an object containing relation schemas for inserts.
 */
type InsertRelationSchemas<
  N,
  T extends Database.Schema,
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>,
  R extends AnyObject
> = {
  [P in keyof R as IsOptionalRelation<R[P], P, T, I, true> extends true ? RelationTargetAlias<P> : never]?: ChangeRelationSchema<
    N,
    R[P],
    P,
    S,
    I
  >;
} & {
  [P in keyof R as IsOptionalRelation<R[P], P, T, I, true> extends false ? RelationTargetAlias<P> : never]: ChangeRelationSchema<
    N,
    R[P],
    P,
    S,
    I
  >;
};

/**
 * Produce an object containing relation schemas for selects.
 */
type SelectRelationSchemas<S extends Record<string, Database.Schema>, I extends Record<string, Database.Indexes>, R extends AnyObject> = {
  [P in keyof R as RelationTargetAlias<P>]?: SelectRelationSchema<R[P], S, I>;
};

/**
 * Produce an object containing relation schemas for records.
 */
type RecordsRelationSchemas<
  T extends Database.Schema,
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>,
  R extends AnyObject
> = {
  [P in keyof R as IsOptionalRelation<R[P], P, T, I, false> extends true ? RelationTargetAlias<P> : never]?: RecordRelationSchema<
    R[P],
    S,
    I
  >;
} & {
  [P in keyof R as IsOptionalRelation<R[P], P, T, I, false> extends false ? RelationTargetAlias<P> : never]: RecordRelationSchema<
    R[P],
    S,
    I
  >;
};

/**
 * Produce an object containing all nested relation schemas for select operations.
 */
type NestedSelectRelationSchemas<
  T extends Database.Table[],
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>,
  R extends AnyObject
> = {
  [P in keyof R as RelationTargetAlias<P>]?: RelationSourceTable<R[P]> extends keyof MergeRelations<T, T, S, I>
    ? MergeRelations<T, T, S, I>[RelationSourceTable<R[P]>] extends { selects: infer N }
      ? N
      : never
    : never;
};

/**
 * Produce an object containing all nested relation schemas for records.
 */
type NestedRecordsRelationSchemas<
  T extends Database.Table[],
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>,
  R extends AnyObject
> = {
  [P in keyof R as RelationTargetAlias<P>]?: RelationSourceTable<R[P]> extends keyof MergeRelations<T, T, S, I>
    ? MergeRelations<T, T, S, I>[RelationSourceTable<R[P]>] extends { records: infer N }
      ? N
      : never
    : never;
};

/**
 * Produce a type corresponding to the source column schema.
 */
type SourceColumnSchema<C, S extends Record<string, Database.Schema>> = PropertyType<RelationSourceTable<C>, S>;

/**
 * Produce a change relation schema according to its indexation.
 */
type ChangeRelationSchema<N, C, V, S extends Record<string, Database.Schema>, I extends Record<string, Database.Indexes>> =
  IsPrimarySourceIndex<C, I> extends true
    ? Exclusive<SourceColumnSchema<C, S>, PrimaryKeyConnectionSchema<C, S, I>>
    : IsUniqueSourceIndex<C, I> extends true
      ? IsPrimaryTargetIndex<V, PropertyType<N, I>> extends true
        ? Exclusive<Omit<SourceColumnSchema<C, S>, RelationSourceColumn<C>>, UniqueKeyConnectionSchema<C, S, I>>
        : Exclusive<SourceColumnSchema<C, S>, UniqueKeyConnectionSchema<C, S, I>>
      : Exclusive<Omit<SourceColumnSchema<C, S>, RelationSourceColumn<C>>, PrimaryKeyConnectionSchema<C, S, I>>[];

/**
 * Produce a select relation schema according to its indexation.
 */
type SelectRelationSchema<C, S extends Record<string, Database.Schema>, I extends Record<string, Database.Indexes>> =
  IsPrimarySourceIndex<C, I> extends true
    ? SourceColumnSchema<C, S>
    : IsUniqueSourceIndex<C, I> extends true
      ? SourceColumnSchema<C, S>
      : SourceColumnSchema<C, S>;

/**
 * Produce a record relation schema according to its indexation.
 */
type RecordRelationSchema<C, S extends Record<string, Database.Schema>, I extends Record<string, Database.Indexes>> =
  IsPrimarySourceIndex<C, I> extends true
    ? SourceColumnSchema<C, S>
    : IsUniqueSourceIndex<C, I> extends true
      ? SourceColumnSchema<C, S>
      : SourceColumnSchema<C, S>[];

/**
 * Produce a relation schema for connections using primary keys.
 */
type PrimaryKeyConnectionSchema<C, S extends Record<string, Database.Schema>, I extends Record<string, Database.Indexes>> = Prettify<{
  [P in keyof PrimaryIndexes<PropertyType<RelationSourceTable<C>, I>>]:
    | PropertyType<P, PropertyType<RelationSourceTable<C>, S>>
    | undefined
    | null;
}>;

/**
 * Produce a relation schema for connections using unique keys.
 */
type UniqueKeyConnectionSchema<C, S extends Record<string, Database.Schema>, I extends Record<string, Database.Indexes>> = Prettify<{
  [P in keyof UniqueIndexes<PropertyType<RelationSourceTable<C>, I>> as P extends RelationSourceColumn<C> ? P : never]:
    | PropertyType<P, PropertyType<RelationSourceTable<C>, S>>
    | undefined
    | null;
}>;
