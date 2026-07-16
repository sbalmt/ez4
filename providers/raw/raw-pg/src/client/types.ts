import type { InsensitiveMode, LockMode, OrderMode, PaginationMode, ParametersMode, TransactionMode } from '@ez4/database';

/**
 * Default Postgres engine settings for raw-pg.
 *
 * Targets any Postgres-compatible server reachable via TCP (Supabase, Neon, RDS direct, etc.).
 * Connection is supplied at runtime via `localOptions.<service>.connectionString` (dev/emulator)
 * or env var (prod).
 */
export type PostgresEngine = {
  parametersMode: ParametersMode.NameAndIndex;
  transactionMode: TransactionMode.Interactive;
  insensitiveMode: InsensitiveMode.Enabled;
  paginationMode: PaginationMode.Offset;
  orderMode: OrderMode.AnyColumns;
  lockMode: LockMode.Supported;
  options: {};
  name: 'raw-pg';
};
