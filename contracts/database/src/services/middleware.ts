import type { Service as CommonService } from '@ez4/common';
import type { TableStreamHandler } from './handler';
import type { TableSchema } from './schemas';
import type { Database } from './contract';

/**
 * Database table stream middleware.
 */
export type TableStreamMiddleware<T extends TableSchema> = (
  next: TableStreamHandler<T>,
  context: CommonService.Context<Database.Service<any>>
) => TableStreamHandler<T>;
