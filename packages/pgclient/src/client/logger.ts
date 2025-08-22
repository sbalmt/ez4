import type { PgExecuteStatement } from '@ez4/pgclient';
import type { AnyObject } from '@ez4/utils';

export const logQuerySuccess = (statement: PgExecuteStatement, transactionId?: string) => {
  const transaction = getTransactionId(transactionId);
  const parameters = getDebugParameters(statement);

  console.debug({
    type: 'PgSQL',
    query: statement.query,
    ...(transaction && {
      transaction
    }),
    ...(parameters && {
      parameters
    })
  });
};

export const logQueryError = (statement: PgExecuteStatement, transactionId?: string) => {
  const transaction = getTransactionId(transactionId);
  const parameters = getDebugParameters(statement);

  console.error({
    type: 'PgSQL',
    query: statement.query,
    ...(transaction && {
      transaction
    }),
    ...(parameters && {
      parameters
    })
  });
};

const isLocal = () => {
  return process.env.EZ4_IS_LOCAL === 'true';
};

const getTransactionId = (transactionId: string | undefined) => {
  return transactionId?.substring(0, 8);
};

const getDebugParameters = (statement: PgExecuteStatement) => {
  if (!isLocal() || !statement.variables?.length) {
    return undefined;
  }

  const parameters: AnyObject = {};

  for (const { name, value } of statement.variables) {
    parameters[name] = value;
  }

  return parameters;
};
