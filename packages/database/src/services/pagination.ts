import type { TableMetadata } from './table.js';
import type { EngineUtils } from './engine.js';

/**
 * Pagination mode.
 */
export const enum PaginationMode {
  Cursor = 'cursor',
  Offset = 'offset'
}

/**
 * Pagination utils.
 */
export namespace PaginationUtils {
  /**
   * Get the pagination range based on the given table metadata.
   */
  export type Range<T extends TableMetadata> =
    EngineUtils.GetPaginationMode<T> extends PaginationMode.Cursor ? { cursor?: string; limit?: number } : { skip?: number; take?: number };

  /**
   * Get the pagination begin based on the given table metadata.
   */
  export type Begin<T extends TableMetadata> =
    EngineUtils.GetPaginationMode<T> extends PaginationMode.Cursor ? { cursor?: string } : { skip?: number };

  /**
   * Get the pagination end based on the given table metadata.
   */
  export type End<T extends TableMetadata> =
    EngineUtils.GetPaginationMode<T> extends PaginationMode.Cursor ? { limit?: number } : { take?: number };

  /**
   * Get the pagination result based on the given table metadata.
   */
  export type Result<T extends TableMetadata> = EngineUtils.GetPaginationMode<T> extends PaginationMode.Cursor ? { cursor?: string } : {};
}
