import type { ArrayRest, IsArrayEmpty, PropertyType } from '@ez4/utils';
import type { IndexedTables, PrimaryIndexes } from './indexes.js';
import type { Database, DatabaseTables } from './database.js';
import type { TableSchemas } from './schemas.js';

/**
 * Internal relation type.
 */
export type Relations = Record<string, unknown>;

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
export type RelationTables<T extends Database.Service<any>> = MergeRelations<
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
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>
> =
  IsArrayEmpty<T> extends true
    ? {}
    : TableRelation<T[0], S, I> & MergeRelations<ArrayRest<T>, S, I>;

/**
 * Given a database table `T`, it produces an object containing all its relations.
 */
type TableRelation<
  T,
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>
> = T extends { name: infer N; relations: infer R }
  ? N extends string
    ? R extends Relations
      ? {
          [P in N]: RequiredRelationSchemas<PropertyType<N, S>, S, I, R> &
            OptionalRelationSchemas<PropertyType<N, S>, S, I, R>;
        }
      : {}
    : {}
  : {};

/**
 * Produce an object containing only required relation schemas.
 */
type RequiredRelationSchemas<
  T extends Database.Schema,
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>,
  R extends Relations
> = {
  [C in keyof R as IsOptionalRelation<C, R[C], T, I> extends true
    ? never
    : RelationTargetAlias<R[C]>]: RelationSchema<C, S, I>;
};

/**
 * Produce an object containing only optional relation schemas.
 */
type OptionalRelationSchemas<
  T extends Database.Schema,
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>,
  R extends Relations
> = {
  [C in keyof R as IsOptionalRelation<C, R[C], T, I> extends true
    ? RelationTargetAlias<R[C]>
    : never]?: RelationSchema<C, S, I>;
};

/**
 * Check whether a relation is optional or not.
 */
type IsOptionalRelation<
  C,
  V,
  S extends Database.Schema,
  I extends Record<string, Database.Indexes>
> =
  RelationSourceColumn<C> extends keyof PrimaryIndexes<PropertyType<RelationSourceTable<C>, I>>
    ? undefined extends PropertyType<RelationTargetColumn<V>, S>
      ? true
      : false
    : true;

/**
 * Produce a relation schema according to its indexation.
 */
type RelationSchema<
  C,
  S extends Record<string, Database.Schema>,
  I extends Record<string, Database.Indexes>
> =
  RelationSourceColumn<C> extends keyof PrimaryIndexes<PropertyType<RelationSourceTable<C>, I>>
    ? PropertyType<RelationSourceTable<C>, S>
    : Omit<PropertyType<RelationSourceTable<C>, S>, RelationSourceColumn<C>>[];
