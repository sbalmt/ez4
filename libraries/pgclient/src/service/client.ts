import type { Database, Client as DbClient, ParametersModeUtils, TransactionModeUtils } from '@ez4/database';
import type { PgTableRepository } from '../types/repository';
import type { InternalTableMetadata } from '../types/table';
import type { PgClientDriver } from '../types/driver';

import { MissingRepositoryTableError } from '@ez4/pgclient';

import { prepareDeleteOne, prepareInsertOne, prepareUpdateOne } from '../queries/queries';
import { getRelationsWithSchema } from './relations';
import { Table } from './table';

type TableType = Table<InternalTableMetadata>;

export type PgClientContext = {
  repository: PgTableRepository;
  driver: PgClientDriver;
  transactionId?: string;
  debug?: boolean;
};

export namespace PgClient {
  export const make = <T extends Database.Service>(context: PgClientContext): DbClient<T> => {
    const { driver, repository, transactionId, debug } = context;

    const tableCache: Record<string, TableType> = {};

    const clientInstance = new (class {
      rawQuery(query: string, parameters: ParametersModeUtils.Type<T> = []) {
        const statement = {
          variables: getStatementParameters(driver, parameters),
          query
        };

        return driver.executeStatement(statement, {
          transactionId,
          debug
        });
      }

      async transaction<O extends TransactionModeUtils.Type<T, R>, R>(operation: O) {
        if (!isStaticTransaction<T>(operation)) {
          return executeInteractiveTransaction(context, operation);
        }

        await executeStaticTransaction<T>(context, operation);
      }
    })();

    return new Proxy<any>(clientInstance, {
      get: (target, property) => {
        if (property in target) {
          return Reflect.get(target, property);
        }

        const tableAlias = property.toString();

        if (!repository[tableAlias]) {
          return undefined;
        }

        if (tableCache[tableAlias]) {
          return tableCache[tableAlias];
        }

        const { name, schema } = repository[tableAlias];

        const relationsWithSchema = getRelationsWithSchema(name, repository);

        const table = new Table(name, schema, relationsWithSchema, context);

        tableCache[tableAlias] = table;

        return table;
      }
    });
  };
}

const getStatementParameters = <T extends Database.Service>(driver: PgClientDriver, parameters: ParametersModeUtils.Type<T>) => {
  if (Array.isArray(parameters)) {
    return getParametersFromList(driver, parameters);
  }

  return getParametersFromMap(driver, parameters);
};

const getParametersFromList = (driver: PgClientDriver, parameters: unknown[]) => {
  return parameters.map((value, index) => {
    const field = index.toString();
    const parameter = driver.prepareVariable(field, value);

    return parameter;
  });
};

const getParametersFromMap = (driver: PgClientDriver, parameters: Record<string, unknown>) => {
  const parameterList = [];

  for (const field in parameters) {
    const value = parameters[field];

    if (value !== undefined) {
      const parameter = driver.prepareVariable(field, value);
      parameterList.push(parameter);
    }
  }

  return parameterList;
};

const isStaticTransaction = <T extends Database.Service>(operation: unknown): operation is TransactionModeUtils.StaticOperationType<T> => {
  return !(operation instanceof Function);
};

const executeInteractiveTransaction = async (context: PgClientContext, operation: Function) => {
  const { driver } = context;

  if (context.transactionId) {
    return operation(PgClient.make(context));
  }

  const transactionId = await driver.beginTransaction();

  try {
    const instance = PgClient.make({
      ...context,
      transactionId
    });

    const result = await operation(instance);

    await driver.commitTransaction(transactionId);

    return result;
  } catch (error) {
    await driver.rollbackTransaction(transactionId);

    throw error;
  }
};

const executeStaticTransaction = async <T extends Database.Service>(
  context: PgClientContext,
  operations: TransactionModeUtils.StaticOperationType<T>
) => {
  const { driver, repository, transactionId, debug } = context;

  const statements = await prepareStaticTransaction<T>(driver, repository, operations);

  if (transactionId) {
    return driver.executeStatements(statements, { transactionId, debug });
  }

  return driver.executeTransaction(statements, { debug });
};

const prepareStaticTransaction = async <T extends Database.Service>(
  driver: PgClientDriver,
  repository: PgTableRepository,
  operations: TransactionModeUtils.StaticOperationType<T>
) => {
  const statements = [];

  for (const tableAlias in operations) {
    const repositoryTable = repository[tableAlias];
    const operationTable = operations[tableAlias];

    if (!operationTable) {
      continue;
    }

    if (!repositoryTable) {
      throw new MissingRepositoryTableError(tableAlias);
    }

    const { name, schema } = repositoryTable;

    const relationsWithSchema = getRelationsWithSchema(name, repository);

    for (const query of operationTable) {
      if (!query) {
        continue;
      }

      if ('insert' in query) {
        statements.push(await prepareInsertOne(name, schema, relationsWithSchema, driver, query.insert));
        continue;
      }

      if ('update' in query) {
        statements.push(await prepareUpdateOne(name, schema, relationsWithSchema, driver, query.update));
        continue;
      }

      if ('delete' in query) {
        statements.push(prepareDeleteOne(name, schema, relationsWithSchema, driver, query.delete));
      }
    }
  }

  return statements;
};
