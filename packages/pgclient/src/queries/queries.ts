import type { ObjectSchema } from '@ez4/schema';
import type { Query } from '@ez4/database';
import type { RepositoryRelationsWithSchema } from '../types/repository.js';
import type { PgClientDriver, PgExecuteStatement } from '../types/driver.js';
import type { InternalTableMetadata } from '../types/table.js';

import { createQueryBuilder } from '../utils/builder.js';

import { prepareInsertQuery } from './insert.js';
import { prepareUpdateQuery } from './update.js';
import { prepareSelectQuery } from './select.js';
import { prepareDeleteQuery } from './delete.js';
import { prepareCountQuery } from './count.js';

export const prepareInsertOne = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  driver: PgClientDriver,
  query: Query.InsertOneInput<S, T>
): Promise<PgExecuteStatement> => {
  const builder = createQueryBuilder(driver);

  const [statement, variables] = await prepareInsertQuery(table, schema, relations, query, builder);

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
  relations: RepositoryRelationsWithSchema,
  driver: PgClientDriver,
  query: Query.FindOneInput<S, T>
) => {
  const builder = createQueryBuilder(driver);

  const [statement, variables] = prepareSelectQuery(table, schema, relations, query, builder);

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
  relations: RepositoryRelationsWithSchema,
  driver: PgClientDriver,
  query: Query.UpdateOneInput<S, T>
) => {
  const builder = createQueryBuilder(driver);

  const [statement, variables] = await prepareUpdateQuery(table, schema, relations, query, builder);

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
  relations: RepositoryRelationsWithSchema,
  driver: PgClientDriver,
  query: Query.DeleteOneInput<S, T>
) => {
  const builder = createQueryBuilder(driver);

  const [statement, variables] = prepareDeleteQuery(table, schema, relations, query, builder);

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
  relations: RepositoryRelationsWithSchema,
  driver: PgClientDriver,
  query: Query.InsertManyInput<T>
) => {
  const builder = createQueryBuilder(driver);

  return Promise.all(
    query.data.map(async (data) => {
      const [statement, variables] = await prepareInsertQuery(table, schema, relations, { data }, builder);

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
  relations: RepositoryRelationsWithSchema,
  driver: PgClientDriver,
  query: Query.FindManyInput<S, C, T>
) => {
  const builder = createQueryBuilder(driver);

  const [statement, variables] = prepareSelectQuery(table, schema, relations, query, builder);

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
  relations: RepositoryRelationsWithSchema,
  driver: PgClientDriver,
  query: Query.UpdateManyInput<S, T>
) => {
  const builder = createQueryBuilder(driver);

  const [statement, variables] = await prepareUpdateQuery(table, schema, relations, query, builder);

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
  relations: RepositoryRelationsWithSchema,
  driver: PgClientDriver,
  query: Query.DeleteManyInput<S, T>
) => {
  const builder = createQueryBuilder(driver);

  const [statement, variables] = prepareDeleteQuery(table, schema, relations, query, builder);

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
  relations: RepositoryRelationsWithSchema,
  driver: PgClientDriver,
  query: Query.CountInput<T>
) => {
  const builder = createQueryBuilder(driver);

  const [statement, variables] = prepareCountQuery(table, schema, relations, query, builder);

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
