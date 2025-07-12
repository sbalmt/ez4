import type { PgExecuteStatement } from '@ez4/pgclient';

export const logQuerySuccess = (statement: PgExecuteStatement, transactionId?: string) => {
  console.debug({
    query: statement.query,
    transaction: getTransactionId(transactionId),
    type: 'PgSQL'
  });
};

export const logQueryError = (statement: PgExecuteStatement, transactionId?: string) => {
  console.error({
    query: statement.query,
    transaction: getTransactionId(transactionId),
    type: 'PgSQL'
  });
};

const getTransactionId = (transactionId: string | undefined) => {
  return transactionId?.substring(0, 8) ?? '-';
};
