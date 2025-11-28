import type { Service as CommonService } from '@ez4/common';
import type { StreamAnyChange } from './streams';
import type { TableSchema } from './schemas';
import type { Database } from './contract';

/**
 * Incoming table stream event.
 */
export type TableStreamIncoming<T extends TableSchema> = StreamAnyChange<T> & TableStreamRequest;

/**
 * Table stream request.
 */
export type TableStreamRequest = {
  /**
   * Request tracking Id.
   */
  readonly requestId: string;
};

/**
 * Table stream listener.
 */
export type TableStreamListener<T extends TableSchema> = (
  event: CommonService.AnyEvent<TableStreamIncoming<T>>,
  context: CommonService.Context<Database.Service>
) => Promise<void> | void;

/**
 * Table stream handler.
 */
export type TableStreamHandler<T extends TableSchema> = (
  request: TableStreamIncoming<T>,
  context: CommonService.Context<Database.Service>
) => Promise<void> | void;
