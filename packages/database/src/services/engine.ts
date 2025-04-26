/**
 * Transaction type.
 */
export const enum TransactionType {
  Interactive = 'interactive',
  Static = 'static'
}

/**
 * Parameters type.
 */
export const enum ParametersType {
  NameAndIndex = 'both',
  OnlyIndex = 'index'
}

/**
 * Database engine.
 */
export type DatabaseEngine = {
  transaction: TransactionType;
  parameters: ParametersType;
  name: string;
};
