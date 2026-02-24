import type { AnySchema, EnumSchema, ObjectSchema, ObjectSchemaProperties, ScalarSchema } from '@ez4/schema';
import type { ObjectComparison } from '@ez4/utils';
import type { SqlBuilder } from '@ez4/pgsql';
import type { PgMigrationQueries } from '../types/query';

import { isEnumSchema, isScalarSchema, SchemaType } from '@ez4/schema';
import { isNotNullish } from '@ez4/utils';

import { getCheckConstraintQuery, getCheckValidationQuery } from '../utils/checks';
import { getConstraintName } from '../utils/naming';

type ConstraintMigrationQueries = Pick<PgMigrationQueries, 'constraints' | 'validations'>;

export namespace ConstraintQuery {
  export const prepareCreate = (builder: SqlBuilder, table: string, columns: Record<string, AnySchema>) => {
    const statements: ConstraintMigrationQueries = {
      constraints: [],
      validations: []
    };

    for (const columnName in columns) {
      const columnSchema = columns[columnName];

      if (isEnumSchema(columnSchema) || (isScalarSchema(columnSchema) && isNotNullish(columnSchema.definitions?.value))) {
        const name = getConstraintName(table, columnName);

        statements.constraints.push({
          check: getCheckConstraintQuery(builder, name),
          query: getCreateQuery(builder, table, name, columnName, columnSchema).build()
        });

        statements.validations.push({
          check: getCheckValidationQuery(builder, name),
          query: getValidationQuery(builder, table, name).build()
        });
      }
    }

    return statements;
  };

  export const prepareUpdate = (
    builder: SqlBuilder,
    table: string,
    targetSchema: ObjectSchema,
    sourceSchema: ObjectSchema,
    changes: Record<string, ObjectComparison>
  ) => {
    const statements: ConstraintMigrationQueries = {
      constraints: [],
      validations: []
    };

    for (const columnName in changes) {
      const { update, create, remove } = changes[columnName];

      if (remove || update) {
        const schema = sourceSchema.properties[columnName];

        if (isConstrainedSchema(schema)) {
          const name = getConstraintName(table, columnName);

          statements.constraints.push({
            query: getDeleteQuery(builder, table, name).build()
          });
        }
      }

      if (create || update) {
        const schema = targetSchema.properties[columnName];

        if (isConstrainedSchema(schema)) {
          const name = getConstraintName(table, columnName);

          statements.constraints.push({
            check: getCheckConstraintQuery(builder, name),
            query: getCreateQuery(builder, table, name, columnName, schema).build()
          });

          statements.validations.push({
            check: getCheckValidationQuery(builder, name),
            query: getValidationQuery(builder, table, name).build()
          });
        }
      }
    }

    return statements;
  };

  export const prepareRenameTable = (builder: SqlBuilder, fromTable: string, toTable: string, columns: Record<string, AnySchema>) => {
    const statements = [];

    for (const columnName in columns) {
      const columnSchema = columns[columnName];

      if (isConstrainedSchema(columnSchema)) {
        const oldName = getConstraintName(fromTable, columnName);
        const newName = getConstraintName(toTable, columnName);

        const query = builder.table(toTable).alter().existing().constraint(oldName).rename(newName);

        statements.push({
          check: getCheckConstraintQuery(builder, newName),
          query: query.build()
        });
      }
    }

    return statements;
  };

  export const prepareRenameColumns = (
    builder: SqlBuilder,
    table: string,
    columns: ObjectSchemaProperties,
    changes: Record<string, string>
  ) => {
    const statements = [];

    for (const fromColumn in changes) {
      const toColum = changes[fromColumn];
      const toSchema = columns[toColum];

      if (isConstrainedSchema(toSchema)) {
        const oldName = getConstraintName(table, fromColumn);
        const newName = getConstraintName(table, toColum);

        const query = builder.table(table).alter().existing().constraint(oldName).rename(newName);

        statements.push({
          check: getCheckConstraintQuery(builder, newName),
          query: query.build()
        });
      }
    }

    return statements;
  };

  export const prepareDelete = (builder: SqlBuilder, table: string, columns: Record<string, AnySchema>) => {
    const statements = [];

    for (const columnName in columns) {
      const columnSchema = columns[columnName];

      if (isConstrainedSchema(columnSchema)) {
        const name = getConstraintName(table, columnName);

        statements.push({
          query: getDeleteQuery(builder, table, name).build()
        });
      }
    }

    return statements;
  };

  const isConstrainedSchema = (schema: AnySchema): schema is EnumSchema | ScalarSchema => {
    return isEnumSchema(schema) || (isScalarSchema(schema) && isNotNullish(schema.definitions?.value));
  };

  const getDeleteQuery = (builder: SqlBuilder, table: string, name: string) => {
    return builder.table(table).alter().existing().constraint(name).drop().existing();
  };

  const getValidationQuery = (builder: SqlBuilder, table: string, name: string) => {
    return builder.table(table).alter().existing().constraint(name).validate();
  };

  const getCreateQuery = (builder: SqlBuilder, table: string, name: string, column: string, schema: EnumSchema | ScalarSchema) => {
    const query = builder.table(table).alter().existing().constraint(name);

    switch (schema.type) {
      case SchemaType.Enum: {
        const values = schema.options.map(({ value }) => `${value}`);

        const constraint = query.check({
          [column]: {
            isIn: values
          }
        });

        constraint.validate(false);
        break;
      }

      case SchemaType.Boolean:
      case SchemaType.Number:
      case SchemaType.String: {
        const constraint = query.check({
          [column]: {
            equal: schema.definitions?.value
          }
        });

        constraint.validate(false);
        break;
      }
    }

    return query;
  };
}
