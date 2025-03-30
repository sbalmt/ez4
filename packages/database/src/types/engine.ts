import type { TransactionType } from '../services/engine.js';

export type DatabaseEngine = {
  transaction: TransactionType;
  name: string;
};
