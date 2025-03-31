/**
 * Transaction type.
 */
export const enum TransactionType {
  Interactive = 'interactive',
  Static = 'static'
}

/**
 * Database engine.
 */
export type DatabaseEngine = {
  transaction: TransactionType;
  name: string;
};
