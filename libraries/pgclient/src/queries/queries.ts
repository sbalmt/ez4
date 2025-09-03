import type { ObjectSchema } from '@ez4/schema';
import type { Query } from '@ez4/database';
import type { PgRelationRepositoryWithSchema } from '../types/repository';
import type { PgClientDriver, PgExecuteStatement } from '../types/driver';
import type { InternalTableMetadata } from '../types/table';

import { createQueryBuilder } from '../utils/builder';

import { prepareInsertQuery } from './insert';
import { prepareUpdateQuery } from './update';
import { prepareSelectQuery } from './select';
import { prepareDeleteQuery } from './delete';
import { prepareCountQuery } from './count';

export const prepareInsertOne = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  query: Query.InsertOneInput<S, T>
): Promise<PgExecuteStatement> => {
  const builder = createQueryBuilder(driver);

  const allQueries = await prepareInsertQuery(builder, table, schema, relations, query);

  const [statement, variables] = builder.with(allQueries).build();

  return {
    query: statement,
    variables,
    metadata: {
      table,
      relations,
      schema
    }
  };
};

export const prepareFindOne = <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  query: Query.FindOneInput<S, T>
) => {
  const builder = createQueryBuilder(driver);

  const selectQuery = prepareSelectQuery(builder, table, schema, relations, query);

  const [statement, variables] = selectQuery.build();

  return {
    query: statement,
    variables,
    metadata: {
      table,
      relations,
      schema
    }
  };
};

export const prepareUpdateOne = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  query: Query.UpdateOneInput<S, T>
) => {
  const builder = createQueryBuilder(driver);

  const allQueries = await prepareUpdateQuery(builder, table, schema, relations, query);

  const [statement, variables] = builder.with(allQueries).build();

  return {
    query: statement,
    variables,
    metadata: {
      table,
      relations,
      schema
    }
  };
};

export const prepareDeleteOne = <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  query: Query.DeleteOneInput<S, T>
) => {
  const builder = createQueryBuilder(driver);

  const deleteQuery = prepareDeleteQuery(builder, table, schema, relations, query);

  const [statement, variables] = deleteQuery.build();

  return {
    query: statement,
    variables,
    metadata: {
      table,
      relations,
      schema
    }
  };
};

export const prepareInsertMany = async <T extends InternalTableMetadata>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  query: Query.InsertManyInput<T>
) => {
  const builder = createQueryBuilder(driver);

  return Promise.all(
    query.data.map(async (data) => {
      const allQueries = await prepareInsertQuery(builder, table, schema, relations, {
        data
      });

      const [statement, variables] = builder.with(allQueries).build();

      return {
        query: statement,
        variables,
        metadata: {
          table,
          relations,
          schema
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
  query: Query.FindManyInput<S, C, T>
) => {
  const builder = createQueryBuilder(driver);

  const selectQuery = prepareSelectQuery(builder, table, schema, relations, query);

  const [statement, variables] = selectQuery.build();

  return {
    query: statement,
    variables,
    metadata: {
      table,
      relations,
      schema
    }
  };
};

export const prepareUpdateMany = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  query: Query.UpdateManyInput<S, T>
) => {
  const builder = createQueryBuilder(driver);

  const allQueries = await prepareUpdateQuery(builder, table, schema, relations, query);

  const [statement, variables] = builder.with(allQueries).build();

  return {
    query: statement,
    variables,
    metadata: {
      table,
      relations,
      schema
    }
  };
};

export const prepareDeleteMany = <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  query: Query.DeleteManyInput<S, T>
) => {
  const builder = createQueryBuilder(driver);

  const deleteQuery = prepareDeleteQuery(builder, table, schema, relations, query);

  const [statement, variables] = deleteQuery.build();

  return {
    query: statement,
    variables,
    metadata: {
      table,
      relations,
      schema
    }
  };
};

export const prepareCount = <T extends InternalTableMetadata>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  driver: PgClientDriver,
  query: Query.CountInput<T>
) => {
  const builder = createQueryBuilder(driver);

  const countQuery = prepareCountQuery(builder, table, schema, relations, query);

  const [statement, variables] = countQuery.build();

  return {
    query: statement,
    variables,
    metadata: {
      table,
      relations,
      schema
    }
  };
};
