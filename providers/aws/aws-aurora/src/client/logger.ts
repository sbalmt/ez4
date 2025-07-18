import type { PgExecuteStatement } from '@ez4/pgclient';

export const logQuerySuccess = (statement: PgExecuteStatement, transactionId?: string) => {
  const transaction = getTransactionId(transactionId);

  console.debug({
    type: 'PgSQL',
    query: statement.query,
    ...(transaction && {
      transaction
    })
  });
};

export const logQueryError = (statement: PgExecuteStatement, transactionId?: string) => {
  const transaction = getTransactionId(transactionId);

  console.error({
    type: 'PgSQL',
    query: statement.query,
    ...(transaction && {
      transaction
    })
  });
};

const getTransactionId = (transactionId: string | undefined) => {
  return transactionId?.substring(0, 8);
};
