import type { AnyObject, ArrayRest, PropertyType, ExclusiveType, IsArrayEmpty, IsUndefined } from '@ez4/utils';
import type { IndexedTables, PrimaryIndexes, UniqueIndexes } from './indexes.js';
import type { Database, DatabaseTables } from './database.js';
import type { TableSchemas } from './schemas.js';

/**
 * Internal relation type.
 */
export type RelationMetadata = {
  indexes: string;
  filters: Record<string, unknown>;
  selects: Record<string, unknown>;
  changes: Record<string, unknown>;
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
export type RelationTables<T extends Database.Service> = MergeRelations<DatabaseTables<T>, TableSchemas<T>, IndexedTables<T>>;

/**
 * Given a list of tables with relations `T`, it produces an object containing all the
 * relation tables.
 */
type MergeRelations<T extends Database.Table[], S extends Record<string, Database.Schema>, I extends Record<string, Database.Indexes>> =
  IsArrayEmpty<T> extends false ? TableRelation<T[0], S, I> & MergeRelations<ArrayRest<T>, S, I> : {};

/**
 * Given a database table `T`, it produces an object containing all its relations.
 */
type TableRelation<T, S extends Record<string, Database.Schema>, I extends Record<string, Database.Indexes>> = T extends {
  name: infer N;
  relations: infer R;
}
  ? N extends string
    ? R extends AnyObject
      ? {
          [P in N]: {
            indexes: RequiredRelationIndexes<PropertyType<N, S>, I, R>;
            filters: FilterableRelationSchemas<S, I, R>;
            changes: RequiredRelationSchemas<PropertyType<N, S>, S, I, R, true> &
              OptionalRelationSchemas<PropertyType<N, S>, S, I, R, true>;
            selects: RequiredRelationSchemas<PropertyType<N, S>, S, I, R, false> &
              OptionalRelationSchemas<PropertyType<N, S>, S, I, R, false>;
          };
        }
      : {}
    : {}
  : {};

/**
 * Produce an object containing all required relation indexes.
 */
type RequiredRelationIndexes<T extends Database.Schema, I extends Record<string, Database.Indexes>, R extends AnyObject> = keyof {
  [C in keyof R as IsOptionalRelation<C, R[C], T, I, true> extends true ? never : RelationTargetColumn<R[C]>]: never;
};

/**
 * Produce an object containing all filterable relation schemas.
 */
type FilterableRelationSchemas<
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>,
  R extends AnyObject
> = {
  [C in keyof R as RelationTargetAlias<R[C]>]: IsPrimaryIndex<C, I> extends false
    ? Omit<PropertyType<RelationSourceTable<C>, S>, RelationSourceColumn<C>>
    : PropertyType<RelationSourceTable<C>, S>;
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
  [C in keyof R as IsOptionalRelation<C, R[C], T, I, E> extends false ? RelationTargetAlias<R[C]> : never]: RelationSchema<
    C,
    R[C],
    T,
    S,
    I,
    E
  >;
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
  [C in keyof R as IsOptionalRelation<C, R[C], T, I, E> extends true ? RelationTargetAlias<R[C]> : never]?: RelationSchema<
    C,
    R[C],
    T,
    S,
    I,
    E
  >;
};

/**
 * Check whether a relation is optional or not.
 */
type IsOptionalRelation<C, V, T extends Database.Schema, I extends Record<string, Database.Indexes>, E extends boolean> =
  RelationSourceColumn<C> extends keyof PrimaryIndexes<PropertyType<RelationSourceTable<C>, I>>
    ? IsUndefined<PropertyType<RelationTargetColumn<V>, T>> extends true
      ? true
      : false
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
 * Produce a relation schema according to its indexation.
 */
type RelationSchema<
  C,
  V,
  T extends Database.Schema,
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>,
  E extends boolean
> =
  IsPrimaryIndex<C, I> extends true
    ? E extends false
      ? PropertyType<RelationSourceTable<C>, S>
      : ExclusiveType<PropertyType<RelationSourceTable<C>, S>, { [P in RelationTargetColumn<V>]: PropertyType<RelationTargetColumn<V>, T> }>
    : IsUniqueIndex<C, I> extends true
      ? E extends false
        ? PropertyType<RelationSourceTable<C>, S>
        : Omit<PropertyType<RelationSourceTable<C>, S>, RelationSourceColumn<C>>
      : Omit<PropertyType<RelationSourceTable<C>, S>, RelationSourceColumn<C>>[];
