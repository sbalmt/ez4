import type { ArrayRest, IsArrayEmpty, PropertyType } from '@ez4/utils';
import type { Database, DatabaseTables } from './database.js';
import type { TableSchemas } from './schemas.js';

/**
 * Given a relation name `T`, it produces the relation alias name.
 */
export type RelationAlias<T> = T extends `${infer U}@${string}` ? U : T extends string ? T : never;

/**
 * Given a relation name `T`, it produces the relation column name.
 */
export type RelationColumn<T> = T extends `${string}@${infer U}` ? U : never;

/**
 * Given a database service `T`, it produces an object containing all relation table schemas.
 */
export type RelationTableSchemas<T extends Database.Service<any>> = {
  [P in keyof TableRelations<T>]: TableRelations<T>[P] extends { schema: infer U } ? U : never;
};

/**
 * Given a database service `T`, it produces an object containing all relation table fields.
 */
export type RelationTableFields<T extends Database.Service<any>> = {
  [P in keyof TableRelations<T>]: TableRelations<T>[P] extends { field: infer U } ? U : never;
};

/**
 * Given a database service `T`, it produces an object with all relation tables.
 */
type TableRelations<T extends Database.Service<any>> = MergeRelations<
  DatabaseTables<T>,
  TableSchemas<T>
>;

/**
 * Given a list of tables with relations `T`, it produces an object containing all the
 * relation tables.
 */
type MergeRelations<T extends Database.Table[], U extends Database.Schema> =
  IsArrayEmpty<T> extends true ? {} : TableRelation<T[0], U> & MergeRelations<ArrayRest<T>, U>;

/**
 * Given a database table `T`, it produces an object containing all its relations.
 */
type TableRelation<T, U extends Database.Schema> = T extends { name: infer N; relations: infer R }
  ? N extends string
    ? {
        [P in N]: {
          schema: {
            [A in keyof R as RelationAlias<R[A]>]: PropertyType<A, U>;
          };
          field: {
            [A in keyof R as RelationColumn<R[A]>]: unknown;
          };
        };
      }
    : {}
  : {};
