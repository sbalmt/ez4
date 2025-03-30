/**
 * Transaction type.
 */
export const enum TransactionType {
  Function = 'function',
  Object = 'object'
}

/**
 * Database engine.
 */
export type DatabaseEngine = {
  transaction: TransactionType;
  name: string;
};
