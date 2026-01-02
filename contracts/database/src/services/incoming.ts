import type { TableStreamRequest } from './request';
import type { StreamAnyChange } from './streams';
import type { TableSchema } from './schemas';

/**
 * Incoming table stream event.
 */
export type TableStreamIncoming<T extends TableSchema> = StreamAnyChange<T> & TableStreamRequest;
