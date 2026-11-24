import type { TableStreamHandler } from './handler';
import type { TableSchema } from './schemas';

/**
 * Database table stream middleware.
 */
export type TableStreamMiddleware<T extends TableSchema> = (next: TableStreamHandler<T>) => TableStreamHandler<T>;
