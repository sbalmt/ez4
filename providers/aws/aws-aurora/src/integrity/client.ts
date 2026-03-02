import type { PgMigrationStatement } from '@ez4/pgmigration/library';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { Arn, OperationLogLine } from '@ez4/aws-common';

import { StatementTimeoutException } from '@aws-sdk/client-rds-data';
import { getUpdateQueries } from '@ez4/pgmigration';
import { Tasks, TaskStatus, Wait } from '@ez4/utils';

import { DataClientDriver } from '../client/driver';

export type ConnectionRequest = {
  database: string;
  clusterArn: Arn;
  secretArn: Arn;
};

export type ValidateChangesRequest = ConnectionRequest & {
  repository: {
    target: PgTableRepository;
    source: PgTableRepository;
  };
};

export const validateChanges = async (logger: OperationLogLine, request: ValidateChangesRequest): Promise<void> => {
  logger.update(`Validating integrity`);

  const { clusterArn, secretArn, database, repository } = request;

  const driver = new DataClientDriver({
    resourceArn: clusterArn,
    secretArn,
    database
  });

  const queries = getUpdateQueries(repository.target, repository.source);

  await executeMigrationValidations(logger, driver, queries.validations);
};

const executeMigrationValidations = async (logger: OperationLogLine, driver: DataClientDriver, validations: PgMigrationStatement[]) => {
  const operations = validations.map(
    (statement) => () =>
      Wait.until(async (attempt) => {
        try {
          if (attempt > 1) {
            if (!statement.check) {
              throw new Error(`Missing validation check query.`);
            }

            const { records } = await driver.executeStatement({
              query: statement.check
            });

            const [isValidated] = records;

            if (!isValidated) {
              return Wait.RetryAttempt;
            }

            return true;
          }

          return await executeMigrationStatement(driver, statement);
          //
        } catch (error) {
          if (error instanceof StatementTimeoutException) {
            return Wait.RetryAttempt;
          }

          throw error;
        }
      })
  );

  const results = await Tasks.safeRun(operations, {
    concurrency: 5,
    onProgress: (completed, total) => {
      logger.update(`Validating integrity (${completed} of ${total})`);
    }
  });

  return results.reduce((accumulator, { status }) => {
    if (status === TaskStatus.Success) {
      return accumulator + 1;
    }

    return accumulator;
  }, 0);
};

const executeMigrationStatement = async (driver: DataClientDriver, statement: PgMigrationStatement) => {
  const { check, ...query } = statement;

  if (check) {
    const { records } = await driver.executeStatement({
      query: check
    });

    const [shouldSkip] = records;

    if (shouldSkip) {
      return false;
    }
  }

  await driver.executeStatement(query, {
    noErrorLog: true,
    noTimeout: true
  });

  return true;
};
