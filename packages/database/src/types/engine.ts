import type { Engine } from '../services/engine.js';

export type DatabaseEngine = {
  parametersMode: Engine.ParametersMode;
  transactionMode: Engine.TransactionMode;
  orderMode: Engine.OrderMode;
  name: string;
};
