import type { ObjectSchema } from '@ez4/schema';
import type { Query } from '@ez4/database';
import type { PgRelationRepositoryWithSchema } from '../types/repository';
import type { InternalTableMetadata } from '../types/table';
import type { PgClientDriver } from '../types/driver';
import type { UpdateQueryOptions } from './update';

import { createQueryBuilder } from './utils/builder';

import { prepareInsertQuery } from './insert';
import { prepareUpdateQuery } from './update';
import { prepareSelectQuery } from './select';
import { prepareDeleteQuery } from './delete';
import { prepareExistsQuery } from './exists';
import { prepareCountQuery } from './count';

export const prepareInsertOne = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  input: Query.InsertOneInput<S, T>
) => {
  const builder = createQueryBuilder(driver);

  const { queries, columns } = await prepareInsertQuery(builder, table, schema, relations, input);

  const [statement, variables] = builder.with(queries).build();

  return {
    query: statement,
    variables,
    metadata: {
      schema,
      relations,
      columns,
      table
    }
  };
};

export const prepareFindOne = <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  input: Query.FindOneInput<S, T>
) => {
  const builder = createQueryBuilder(driver);

  const { query, columns } = prepareSelectQuery(builder, table, schema, relations, input);

  const [statement, variables] = query.build();

  return {
    query: statement,
    variables,
    metadata: {
      schema,
      relations,
      columns,
      table
    }
  };
};

export const prepareUpdateOne = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  input: Query.UpdateOneInput<S, T>,
  options?: UpdateQueryOptions
) => {
  const builder = createQueryBuilder(driver);

  const { queries, columns } = await prepareUpdateQuery(builder, table, schema, relations, input, options);

  const [statement, variables] = builder.with(queries).build();

  return {
    query: statement,
    variables,
    metadata: {
      schema,
      relations,
      columns,
      table
    }
  };
};

export const prepareDeleteOne = <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  input: Query.DeleteOneInput<S, T>
) => {
  const builder = createQueryBuilder(driver);

  const { query, columns } = prepareDeleteQuery(builder, table, schema, relations, input);

  const [statement, variables] = query.build();

  return {
    query: statement,
    variables,
    metadata: {
      schema,
      relations,
      columns,
      table
    }
  };
};

export const prepareInsertMany = async <T extends InternalTableMetadata>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  input: Query.InsertManyInput<T>
) => {
  const builder = createQueryBuilder(driver);

  return Promise.all(
    input.data.map(async (data) => {
      const { queries, columns } = await prepareInsertQuery(builder, table, schema, relations, {
        data
      });

      const [statement, variables] = builder.with(queries).build();

      return {
        query: statement,
        variables,
        metadata: {
          schema,
          relations,
          columns,
          table
        }
      };
    })
  );
};

export const prepareFindMany = <T extends InternalTableMetadata, S extends Query.SelectInput<T>, C extends boolean>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  input: Query.FindManyInput<S, C, T>
) => {
  const builder = createQueryBuilder(driver);

  const { query, columns } = prepareSelectQuery(builder, table, schema, relations, input);

  const [statement, variables] = query.build();

  return {
    query: statement,
    variables,
    metadata: {
      schema,
      relations,
      columns,
      table
    }
  };
};

export const prepareUpdateMany = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  input: Query.UpdateManyInput<S, T>
) => {
  const builder = createQueryBuilder(driver);

  const { queries, columns } = await prepareUpdateQuery(builder, table, schema, relations, input);

  const [statement, variables] = builder.with(queries).build();

  return {
    query: statement,
    variables,
    metadata: {
      schema,
      relations,
      columns,
      table
    }
  };
};

export const prepareDeleteMany = <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  input: Query.DeleteManyInput<S, T>
) => {
  const builder = createQueryBuilder(driver);

  const { query, columns } = prepareDeleteQuery(builder, table, schema, relations, input);

  const [statement, variables] = query.build();

  return {
    query: statement,
    variables,
    metadata: {
      schema,
      relations,
      columns,
      table
    }
  };
};

export const prepareExists = <T extends InternalTableMetadata>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  input: Query.ExistsInput<T>
) => {
  const builder = createQueryBuilder(driver);

  const { query, columns } = prepareExistsQuery(builder, table, schema, relations, input);

  const [statement, variables] = query.build();

  return {
    query: statement,
    variables,
    metadata: {
      schema,
      relations,
      columns,
      table
    }
  };
};

export const prepareCount = <T extends InternalTableMetadata>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  input: Query.CountInput<T>
) => {
  const builder = createQueryBuilder(driver);

  const { query, columns } = prepareCountQuery(builder, table, schema, relations, input);

  const [statement, variables] = query.build();

  return {
    query: statement,
    variables,
    metadata: {
      schema,
      relations,
      columns,
      table
    }
  };
};
