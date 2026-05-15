import type { InsensitiveMode, LockMode, OrderMode, PaginationMode, ParametersMode, TransactionMode } from '@ez4/database';

/**
 * External Postgres engine settings.
 *
 * Targets any Postgres-compatible server reachable via TCP (Supabase, Neon, RDS direct, etc.).
 * Connection is supplied at runtime via `localOptions.<service>.connectionString` (dev/emulator)
 * or env var (prod runtime — v0.2).
 */
export type RawPgEngine = {
  parametersMode: ParametersMode.NameAndIndex;
  transactionMode: TransactionMode.Interactive;
  insensitiveMode: InsensitiveMode.Enabled;
  paginationMode: PaginationMode.Offset;
  orderMode: OrderMode.AnyColumns;
  lockMode: LockMode.Supported;
  name: 'raw-pg';
};
