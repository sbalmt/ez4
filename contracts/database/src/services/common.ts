import type { Service as CommonService } from '@ez4/common';
import type { TableSchema } from './schemas';
import type { StreamChange } from './streams';
import type { Database } from './contract';

/**
 * Incoming table stream event.
 */
export type TableStreamIncoming<T extends TableSchema> = StreamChange<T> & TableStreamRequest;

/**
 * Table stream request.
 */
export type TableStreamRequest = {
  /**
   * Request tracking Id.
   */
  requestId: string;
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
