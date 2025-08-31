import type { ParametersMode } from '../services/parameters.js';
import type { TransactionMode } from '../services/transaction.js';
import type { InsensitiveMode } from '../services/insensitive.js';
import type { PaginationMode } from '../services/pagination.js';
import type { OrderMode } from '../services/order.js';

export type DatabaseEngine = {
  parametersMode: ParametersMode;
  transactionMode: TransactionMode;
  insensitiveMode: InsensitiveMode;
  paginationMode: PaginationMode;
  orderMode: OrderMode;
  name: string;
};
