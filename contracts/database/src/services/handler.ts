import type { Service as CommonService } from '@ez4/common';
import type { TableStreamIncoming } from './incoming';
import type { TableSchema } from './schemas';
import type { Database } from './contract';

/**
 * Table stream handler.
 */
export type TableStreamHandler<T extends TableSchema> = (
  request: TableStreamIncoming<T>,
  context: CommonService.Context<Database.Service>
) => Promise<void> | void;
