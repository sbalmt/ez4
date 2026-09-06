import type { PgValidationStatement } from '@ez4/pgmigration/library';
import type { Arn, OperationLogLine } from '@ez4/aws-common';
import type { PgExecuteOptions } from '@ez4/pgclient';

import { Tasks, TaskStatus, Wait } from '@ez4/utils';

import { IntegrityCheckFailedError, IntegrityCheckError } from './errors';
import { ApiClientDriver } from '../client/drivers/api';

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

  const operations = validations.map(
    (statement) => () =>
      Wait.until(
        async (attempt, attempts) => {
          try {
            return await executeIntegrityStatement(driver, statement, options);
          } catch (error) {
            if (attempt < attempts) {
              return Wait.RetryAttempt;
            }

            throw error;
          }
        },
        {
          minDelay: 5,
          maxDelay: 120,
          attempts: 10
        }
      )
  );

  return Tasks.safeRun(operations, {
    concurrency: 5,
    onProgress: (completed, total) => {
      logger.update(`Validating integrity (${completed} of ${total})`);
    }
  });
};

const executeIntegrityStatement = async (driver: ApiClientDriver, statement: PgValidationStatement, options?: PgExecuteOptions) => {
  const { check, query } = statement;

  if (check) {
    const { records } = await driver.executeStatement({ query: check }, options);

    const [shouldSkip] = records;

    if (shouldSkip) {
      return false;
    }
  }

  const { records } = await driver.executeStatement({ query }, options);

  const [hasError] = records;

  if (hasError) {
    throw new IntegrityCheckError(statement.name);
  }

  return true;
};
