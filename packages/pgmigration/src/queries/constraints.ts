import type { AnySchema, EnumSchemaOption, ObjectSchema, ObjectSchemaProperties } from '@ez4/schema';
import type { ObjectComparison } from '@ez4/utils';
import type { SqlBuilder } from '@ez4/pgsql';

import { isEnumSchema } from '@ez4/schema';

import { getCheckConstraintQuery } from '../utils/checks.js';
import { getConstraintName } from '../utils/naming.js';

export namespace ConstraintsQuery {
  export const prepareCreate = (builder: SqlBuilder, table: string, columns: Record<string, AnySchema>) => {
    const statements = [];

    for (const columnName in columns) {
      const columnSchema = columns[columnName];

      if (!isEnumSchema(columnSchema)) {
        continue;
      }

      const name = getConstraintName(table, columnName);

      statements.push({
        check: getCheckConstraintQuery(builder, name),
        query: getCreateQuery(builder, table, name, columnName, columnSchema.options).build()
      });
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
    const statements = [];

    for (const columnName in changes) {
      const { update, create, remove } = changes[columnName];

      if (remove) {
        const schema = sourceSchema.properties[columnName];

        if (isEnumSchema(schema)) {
          const name = getConstraintName(table, columnName);

          statements.push({
            query: getDeleteQuery(builder, table, name).build()
          });
        }
      }

      if (update) {
        const source = sourceSchema.properties[columnName];
        const target = targetSchema.properties[columnName];

        if (isEnumSchema(source) && isEnumSchema(target)) {
          const name = getConstraintName(table, columnName);

          statements.push(
            {
              query: getDeleteQuery(builder, table, name).build()
            },
            {
              query: getCreateQuery(builder, table, name, columnName, target.options).build()
            }
          );
        }
      }

      if (create) {
        const schema = targetSchema.properties[columnName];

        if (isEnumSchema(schema)) {
          const name = getConstraintName(table, columnName);

          statements.push({
            check: getCheckConstraintQuery(builder, name),
            query: getCreateQuery(builder, table, name, columnName, schema.options).build()
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

      if (!isEnumSchema(columnSchema)) {
        continue;
      }

      const oldName = getConstraintName(fromTable, columnName);
      const newName = getConstraintName(toTable, columnName);

      const query = builder.table(toTable).alter().existing().constraint(oldName).rename(newName);

      statements.push({
        check: getCheckConstraintQuery(builder, newName),
        query: query.build()
      });
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

      if (!isEnumSchema(toSchema)) {
        continue;
      }

      const oldName = getConstraintName(table, fromColumn);
      const newName = getConstraintName(table, toColum);

      const query = builder.table(table).alter().existing().constraint(oldName).rename(newName);

      statements.push({
        check: getCheckConstraintQuery(builder, newName),
        query: query.build()
      });
    }

    return statements;
  };

  export const prepareDelete = (builder: SqlBuilder, table: string, columns: Record<string, AnySchema>) => {
    const statements = [];

    for (const columnName in columns) {
      const columnSchema = columns[columnName];

      if (!isEnumSchema(columnSchema)) {
        continue;
      }

      const name = getConstraintName(table, columnName);

      statements.push({
        query: getDeleteQuery(builder, table, name).build()
      });
    }

    return statements;
  };

  const getDeleteQuery = (builder: SqlBuilder, table: string, name: string) => {
    return builder.table(table).alter().existing().constraint(name).drop().existing();
  };

  const getCreateQuery = (builder: SqlBuilder, table: string, name: string, column: string, options: EnumSchemaOption[]) => {
    const values = options.map(({ value }) => `${value}`);

    return builder
      .table(table)
      .alter()
      .existing()
      .constraint(name)
      .check({
        [column]: {
          isIn: values
        }
      });
  };
}
