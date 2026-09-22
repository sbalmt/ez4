import type {
  ParametersMode,
  TransactionMode,
  InsensitiveMode,
  UndefinedMode,
  PaginationMode,
  RelationMode,
  OrderMode,
  StreamMode,
  LockMode
} from '@ez4/database';

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
  undefinedMode: UndefinedMode.Unsupported;
  paginationMode: PaginationMode.Offset;
  relationMode: RelationMode.Supported;
  orderMode: OrderMode.AnyColumns;
  streamMode: StreamMode.Unsupported;
  lockMode: LockMode.Supported;
  options: {};
  name: 'raw-pg';
};
