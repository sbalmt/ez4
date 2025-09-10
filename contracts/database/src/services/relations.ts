import type {
  AnyObject,
  ArrayRest,
  PropertyType,
  ExclusiveType,
  IsArrayEmpty,
  IsUndefined,
  FlatObject,
  MergeObject,
  Prettify
} from '@ez4/utils';
import type { IndexedTables, PrimaryIndexes, UniqueIndexes } from './indexes';
import type { Database, DatabaseTables } from './database';
import type { TableSchemas } from './schemas';

/**
 * Internal relation type.
 */
export type RelationMetadata = {
  filters: Record<string, AnyObject | undefined>;
  selects: Record<string, AnyObject | undefined>;
  changes: Record<string, AnyObject | undefined>;
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
  relations: infer R;
}
  ? N extends string
    ? R extends AnyObject
      ? {
          [P in N]: {
            indexes: RelationIndexes<PropertyType<N, I>, R>;
            filters: FilterableRelationSchemas<S, R>;
            changes: RequiredRelationSchemas<PropertyType<N, S>, S, I, R, true> &
              OptionalRelationSchemas<PropertyType<N, S>, S, I, R, true>;
            selects: FlatObject<RequiredRelationSchemas<PropertyType<N, S>, S, I, R, false>> &
              FlatObject<OptionalRelationSchemas<PropertyType<N, S>, S, I, R, false>> &
              NestedRelationSelects<T, S, I, R>;
            records: MergeObject<
              RequiredRelationSchemas<PropertyType<N, S>, S, I, R, false> & OptionalRelationSchemas<PropertyType<N, S>, S, I, R, false>,
              NestedRelationRecords<T, S, I, R>
            >;
          };
        }
      : {}
    : {}
  : {};

/**
 * Produce an object containing all relation indexes.
 */
type RelationIndexes<I extends Database.Indexes, R extends AnyObject> = keyof {
  [C in keyof R as RelationTargetColumn<C> extends keyof PrimaryIndexes<I> ? never : RelationTargetColumn<C>]: never;
};

/**
 * Produce an object containing all filterable relation schemas.
 */
type FilterableRelationSchemas<S extends Record<string, Database.Schema>, R extends AnyObject> = {
  [C in keyof R as RelationTargetAlias<C>]: Omit<PropertyType<RelationSourceTable<R[C]>, S>, RelationSourceColumn<R[C]>>;
};

/**
 * Produce an object containing only required relation schemas.
 */
type RequiredRelationSchemas<
  T extends Database.Schema,
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>,
  R extends AnyObject,
  E extends boolean
> = {
  [C in keyof R as IsOptionalRelation<R[C], C, T, I, E> extends false ? RelationTargetAlias<C> : never]: RelationSchema<R[C], S, I, E>;
};

/**
 * Produce an object containing only optional relation schemas.
 */
type OptionalRelationSchemas<
  T extends Database.Schema,
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>,
  R extends AnyObject,
  E extends boolean
> = {
  [C in keyof R as IsOptionalRelation<R[C], C, T, I, E> extends true ? RelationTargetAlias<C> : never]?: RelationSchema<R[C], S, I, E>;
};

/**
 * Produce an object containing all nested relation schemas for select operations.
 */
type NestedRelationSelects<
  T extends Database.Table[],
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>,
  R extends AnyObject
> = {
  [C in keyof R as RelationTargetAlias<C>]?: RelationSourceTable<R[C]> extends keyof MergeRelations<T, T, S, I>
    ? MergeRelations<T, T, S, I>[RelationSourceTable<R[C]>] extends { selects: infer N }
      ? N
      : never
    : never;
};

/**
 * Produce an object containing all nested relation schemas for records.
 */
type NestedRelationRecords<
  T extends Database.Table[],
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>,
  R extends AnyObject
> = {
  [C in keyof R as RelationTargetAlias<C>]?: RelationSourceTable<R[C]> extends keyof MergeRelations<T, T, S, I>
    ? MergeRelations<T, T, S, I>[RelationSourceTable<R[C]>] extends { records: infer N }
      ? N
      : never
    : never;
};

/**
 * Check whether a relation is optional or not.
 */
type IsOptionalRelation<C, V, T extends Database.Schema, I extends Record<string, Database.Indexes>, E extends boolean> =
  RelationSourceColumn<C> extends keyof PrimaryIndexes<PropertyType<RelationSourceTable<C>, I>>
    ? IsUndefined<PropertyType<RelationTargetColumn<V>, T>>
    : RelationSourceColumn<C> extends keyof UniqueIndexes<PropertyType<RelationSourceTable<C>, I>>
      ? true
      : E;

/**
 * Check whether a column is primary.
 */
type IsPrimaryIndex<C, I extends Record<string, Database.Indexes>> =
  RelationSourceColumn<C> extends keyof PrimaryIndexes<PropertyType<RelationSourceTable<C>, I>> ? true : false;

/**
 * Check whether a column is unique.
 */
type IsUniqueIndex<C, I extends Record<string, Database.Indexes>> =
  RelationSourceColumn<C> extends keyof UniqueIndexes<PropertyType<RelationSourceTable<C>, I>> ? true : false;

/**
 * Produce a type corresponding to the source index column type.
 */
type ExtractSourceIndexType<C, S extends Record<string, Database.Schema>> = PropertyType<RelationSourceTable<C>, S>;

/**
 * Produce a relation schema according to its indexation.
 */
type RelationSchema<C, S extends Record<string, Database.Schema>, I extends Record<string, Database.Indexes>, E extends boolean> =
  IsPrimaryIndex<C, I> extends true
    ? E extends false
      ? ExtractSourceIndexType<C, S>
      : ExclusiveType<ExtractSourceIndexType<C, S>, RelationConnectionSchema<C, S, I>>
    : IsUniqueIndex<C, I> extends true
      ? E extends false
        ? ExtractSourceIndexType<C, S>
        : ExclusiveType<Omit<ExtractSourceIndexType<C, S>, RelationSourceColumn<C>>, RelationConnectionSchema<C, S, I>>
      : E extends false
        ? ExtractSourceIndexType<C, S>[]
        : ExclusiveType<Omit<ExtractSourceIndexType<C, S>, RelationSourceColumn<C>>, RelationConnectionSchema<C, S, I>>[];

/**
 * Produce a relation schema for connection.
 */
type RelationConnectionSchema<C, S extends Record<string, Database.Schema>, I extends Record<string, Database.Indexes>> = Prettify<{
  [P in keyof PrimaryIndexes<PropertyType<RelationSourceTable<C>, I>>]:
    | PropertyType<P, PropertyType<RelationSourceTable<C>, S>>
    | undefined
    | null;
}>;
