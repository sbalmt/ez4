import type { AnySchema, EnumSchema, ObjectSchema, ScalarSchema } from '@ez4/schema';
import type { AnyObject, ObjectComparison } from '@ez4/utils';
import type { SqlBuilder } from '@ez4/pgsql';
import type { PgMigrationQueries } from '../types/query';

import { isEnumSchema, isScalarSchema, SchemaType } from '@ez4/schema';
import { isNotNullish } from '@ez4/utils';

import { getConstraintName } from '../utils/naming';

import {
  getCheckConstraintExistsQuery,
  getCheckConstraintRecordsQuery,
  getCheckConstraintInvalidQuery,
  getCheckRunningValidationQuery,
  getCheckConstraintValidQuery
} from '../utils/checks';

type ConstraintQueries = Pick<PgMigrationQueries, 'constraints' | 'validations'>;

export namespace ConstraintQuery {
  export const prepareCreate = (builder: SqlBuilder, table: string, columns: Record<string, AnySchema>) => {
    const statements: ConstraintQueries = {
      constraints: [],
      validations: []
    };

    for (const columnName in columns) {
      const columnSchema = columns[columnName];

      if (isEnumSchema(columnSchema) || (isScalarSchema(columnSchema) && isNotNullish(columnSchema.definitions?.value))) {
        const name = getConstraintName(table, columnName);

        statements.constraints.push(
          {
            check: getCheckConstraintExistsQuery(builder, name),
            assert: getCheckConstraintRecordsQuery(builder, table, getConstraintFilters(builder, columnName, columnSchema)),
            query: getCreateQuery(builder, table, name, columnName, columnSchema).build(),
            name
          },
          {
            check: getCheckConstraintValidQuery(builder, name),
            query: getValidateQuery(builder, table, name).build()
          }
        );

        statements.validations.push({
          check: getCheckConstraintInvalidQuery(builder, name),
          retry: getCheckRunningValidationQuery(builder, name),
          name
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
    const steps = {
      rollout: { validations: [], constraints: [] } as ConstraintQueries,
      cleanup: { validations: [], constraints: [] } as ConstraintQueries
    };

    for (const columnName in changes) {
      const { update, create, remove, nested } = changes[columnName];

      if (remove || update || nested) {
        const columnSchema = sourceSchema.properties[columnName];
        const change = { ...remove, ...update, ...nested };

        if (isConstrainedChange(columnSchema, change)) {
          const name = getConstraintName(table, columnName);

          steps.cleanup.constraints.push({
            query: getDeleteQuery(builder, table, name).build()
          });
        }
      }

      if (create || update || nested) {
        const columnSchema = targetSchema.properties[columnName];
        const change = { ...create, ...update, ...nested };

        if (isConstrainedChange(columnSchema, change)) {
          const tmpName = getConstraintName(table, `${columnName}_tmp`);
          const newName = getConstraintName(table, columnName);

          steps.rollout.constraints.push(
            {
              check: getCheckConstraintExistsQuery(builder, tmpName),
              assert: getCheckConstraintRecordsQuery(builder, table, getConstraintFilters(builder, columnName, columnSchema)),
              query: getCreateQuery(builder, table, tmpName, columnName, columnSchema).build(),
              name: newName
            },
            {
              check: getCheckConstraintValidQuery(builder, tmpName),
              query: getValidateQuery(builder, table, tmpName).build()
            }
          );

          steps.rollout.validations.push({
            check: getCheckConstraintInvalidQuery(builder, tmpName),
            retry: getCheckRunningValidationQuery(builder, tmpName),
            name: newName
          });

          steps.cleanup.constraints.push({
            query: builder.table(table).alter().existing().constraint(tmpName).rename(newName).build()
          });
        }
      }
    }

    return steps;
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
          check: getCheckConstraintExistsQuery(builder, newName),
          query: query.build()
        });
      }
    }

    return statements;
  };

  export const prepareRenameColumns = (builder: SqlBuilder, table: string, columnSchema: ObjectSchema, changes: Record<string, string>) => {
    const statements = [];

    for (const fromColumn in changes) {
      const toColum = changes[fromColumn];
      const toSchema = columnSchema.properties[toColum];

      if (isConstrainedSchema(toSchema)) {
        const oldName = getConstraintName(table, fromColumn);
        const newName = getConstraintName(table, toColum);

        const query = builder.table(table).alter().existing().constraint(oldName).rename(newName);

        statements.push({
          check: getCheckConstraintExistsQuery(builder, newName),
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

  const getDeleteQuery = (builder: SqlBuilder, table: string, name: string) => {
    return builder.table(table).alter().existing().constraint(name).drop().existing();
  };

  const getValidateQuery = (builder: SqlBuilder, table: string, name: string) => {
    return builder.table(table).alter().existing().constraint(name).validate();
  };

  const getCreateQuery = (builder: SqlBuilder, table: string, name: string, column: string, schema: EnumSchema | ScalarSchema) => {
    const query = builder.table(table).alter().existing().constraint(name);

    query.check(getConstraintFilters(builder, column, schema)).validate(false);

    return query;
  };

  const getConstraintFilters = (builder: SqlBuilder, column: string, schema: EnumSchema | ScalarSchema) => {
    switch (schema.type) {
      case SchemaType.Enum: {
        return {
          [column]: {
            isIn: schema.options.map(({ value }) => builder.rawString(`${value}`))
          }
        };
      }

      case SchemaType.Boolean:
      case SchemaType.Number:
        return {
          [column]: {
            equal: builder.rawValue(schema.definitions?.value)
          }
        };

      case SchemaType.String: {
        return {
          [column]: {
            equal: builder.rawString(`${schema.definitions?.value}`)
          }
        };
      }
    }
  };

  const isConstrainedSchema = (schema: AnySchema): schema is EnumSchema | ScalarSchema => {
    return isEnumSchema(schema) || (isScalarSchema(schema) && isNotNullish(schema.definitions?.value));
  };

  const isConstrainedChange = (schema: AnySchema, changes: AnyObject): schema is EnumSchema | ScalarSchema => {
    switch (schema.type) {
      case SchemaType.Boolean:
      case SchemaType.Number:
      case SchemaType.String: {
        return isNotNullish(changes.definitions?.value) || isNotNullish(changes.definitions?.update?.value);
      }

      case SchemaType.Enum: {
        return isNotNullish(changes.options);
      }
    }

    return false;
  };
}
