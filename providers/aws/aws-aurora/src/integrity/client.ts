import type { PgValidationStatement } from '@ez4/pgmigration/library';
import type { Arn, OperationLogLine } from '@ez4/aws-common';
import type { PgExecuteOptions } from '@ez4/pgclient';

import { MigrationValidationFailedError } from '@ez4/pgmigration/library';
import { Tasks, TaskStatus, Wait } from '@ez4/utils';

import { ApiClientDriver } from '../client/drivers/api';
import { IntegrityCheckFailedError } from './errors';

export type ConnectionRequest = {
  database: string;
  clusterArn: Arn;
  secretArn: Arn;
};

export type ValidateChangesRequest = ConnectionRequest & {
  queries: PgValidationStatement[];
};

export const validateChanges = async (logger: OperationLogLine, request: ValidateChangesRequest): Promise<void> => {
  logger.update(`Validating integrity`);

  const { clusterArn, secretArn, database, queries } = request;

  const driver = new ApiClientDriver({
    resourceArn: clusterArn,
    secretArn,
    database
  });

  const results = await executeIntegrityChecks(logger, driver, queries);

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

const executeIntegrityChecks = async (logger: OperationLogLine, driver: ApiClientDriver, validations: PgValidationStatement[]) => {
  const options: PgExecuteOptions = {
    noErrorLog: true
  };

  const operations = validations.map((statement) => () => {
    return Wait.until(
      async (attempt, attempts) => {
        try {
          return await executeIntegrityStatement(driver, statement, options);
        } catch (error) {
          if (attempt < attempts && (await isValidationRunning(driver, statement.retry, options))) {
            return Wait.RetryAttempt;
          }

          throw error;
        }
      },
      {
        minDelay: 5,
        maxDelay: 60,
        attempts: 25
      }
    );
  });

  return Tasks.safeRun(operations, {
    concurrency: 5,
    onProgress: (completed, total) => {
      logger.update(`Validating integrity (${completed} of ${total})`);
    }
  });
};

const executeIntegrityStatement = async (driver: ApiClientDriver, statement: PgValidationStatement, options?: PgExecuteOptions) => {
  const { name, check } = statement;

  const { records } = await driver.executeStatement({ query: check }, options);

  const [hasError] = records;

  if (hasError) {
    throw new MigrationValidationFailedError(name);
  }

  return true;
};

const isValidationRunning = async (driver: ApiClientDriver, retry: string, options?: PgExecuteOptions) => {
  const { records } = await driver.executeStatement({ query: retry }, options);

  const [isRunning] = records;

  return !!isRunning;
};
