import type { ParametersType, TransactionType } from '../services/engine.js';

export type DatabaseEngine = {
  transaction: TransactionType;
  parameters: ParametersType;
  name: string;
};
