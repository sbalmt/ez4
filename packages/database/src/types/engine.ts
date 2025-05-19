import { ParametersMode } from '../services/parameters.js';
import { TransactionMode } from '../services/transaction.js';
import { OrderMode } from '../services/order.js';

export type DatabaseEngine = {
  parametersMode: ParametersMode;
  transactionMode: TransactionMode;
  orderMode: OrderMode;
  name: string;
};
