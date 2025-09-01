import type { ParametersMode } from '../services/parameters';
import type { TransactionMode } from '../services/transaction';
import type { InsensitiveMode } from '../services/insensitive';
import type { PaginationMode } from '../services/pagination';
import type { OrderMode } from '../services/order';
import type { LockMode } from '../services/lock';

export type DatabaseEngine = {
  parametersMode: ParametersMode;
  transactionMode: TransactionMode;
  insensitiveMode: InsensitiveMode;
  paginationMode: PaginationMode;
  orderMode: OrderMode;
  lockMode: LockMode;
  name: string;
};
