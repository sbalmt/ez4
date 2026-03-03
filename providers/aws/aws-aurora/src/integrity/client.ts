import type { PgValidationStatement } from '@ez4/pgmigration/library';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { Arn, OperationLogLine } from '@ez4/aws-common';

import { StatementTimeoutException } from '@aws-sdk/client-rds-data';
import { getUpdateQueries } from '@ez4/pgmigration';
import { Tasks, TaskStatus, Wait } from '@ez4/utils';

import { DataClientDriver } from '../client/driver';
import { IntegrityCheckFailedError, IntegrityCheckError } from './errors';

export type ConnectionRequest = {
  database: string;
  clusterArn: Arn;
  secretArn: Arn;
};

export type ValidateChangesRequest = ConnectionRequest & {
  repository: PgTableRepository;
};

export const validateChanges = async (logger: OperationLogLine, request: ValidateChangesRequest): Promise<void> => {
  logger.update(`Validating integrity`);

  const { clusterArn, secretArn, database, repository } = request;

  const driver = new DataClientDriver({
    resourceArn: clusterArn,
    secretArn,
    database
  });

  const queries = getUpdateQueries(repository, {});

  const results = await executeIntegrityChecks(logger, driver, queries.validations);

  assertNoFailureErrors(results);
};

const assertNoFailureErrors = (results: Tasks.Result<boolean>[]) => {
  const errors = [];

  for (const result of results) {
    if (result.status === TaskStatus.Failure) {
      errors.push(`${result.error}`);
    }
  }

  if (errors.length > 0) {
    throw new IntegrityCheckFailedError(errors);
  }
};

const executeIntegrityChecks = async (logger: OperationLogLine, driver: DataClientDriver, validations: PgValidationStatement[]) => {
  const operations = validations.map(
    (statement) => () =>
      Wait.until(async (attempt) => {
        try {
          if (attempt > 1) {
            if (!statement.check) {
              throw new Error(`Missing integrity check query.`);
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

  return Tasks.safeRun(operations, {
    concurrency: 5,
    onProgress: (completed, total) => {
      logger.update(`Validating integrity (${completed} of ${total})`);
    }
  });
};

const executeMigrationStatement = async (driver: DataClientDriver, statement: PgValidationStatement) => {
  const { check, ...change } = statement;

  if (check) {
    const { records } = await driver.executeStatement({
      query: check
    });

    const [shouldSkip] = records;

    if (shouldSkip) {
      return false;
    }
  }

  const { records } = await driver.executeStatement(change, {
    noErrorLog: true,
    noTimeout: true
  });

  const [hasError] = records;

  if (hasError) {
    throw new IntegrityCheckError(change.name);
  }

  return true;
};
