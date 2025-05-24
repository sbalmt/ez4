import { ParametersMode } from '../services/parameters.js';
import { TransactionMode } from '../services/transaction.js';
import { InsensitiveMode } from '../services/insensitive.js';
import { PaginationMode } from '../services/pagination.js';
import { OrderMode } from '../services/order.js';

export type DatabaseEngine = {
  parametersMode: ParametersMode;
  transactionMode: TransactionMode;
  insensitiveMode: InsensitiveMode;
  paginationMode: PaginationMode;
  orderMode: OrderMode;
  name: string;
};
