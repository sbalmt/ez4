import type { Service as CommonService } from '@ez4/common';
import type { TableStreamIncoming } from './incoming';
import type { TableSchema } from './schemas';
import type { Database } from './contract';

/**
 * Table stream listener.
 */
export type TableStreamListener<T extends TableSchema> = (
  event: CommonService.AnyEvent<TableStreamIncoming<T>>,
  context: CommonService.Context<Database.Service>
) => Promise<void> | void;
