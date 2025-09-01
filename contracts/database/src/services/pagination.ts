import type { DatabaseEngine, EngineUtils } from './engine';

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
   * Get the pagination range based on the given database engine.
   */
  export type Range<E extends DatabaseEngine> =
    EngineUtils.GetPaginationMode<E> extends PaginationMode.Cursor ? { cursor?: string; limit?: number } : { skip?: number; take?: number };

  /**
   * Get the pagination begin based on the given table metadata.
   */
  export type Begin<E extends DatabaseEngine> =
    EngineUtils.GetPaginationMode<E> extends PaginationMode.Cursor ? { cursor?: string } : { skip?: number };

  /**
   * Get the pagination end based on the given table metadata.
   */
  export type End<E extends DatabaseEngine> =
    EngineUtils.GetPaginationMode<E> extends PaginationMode.Cursor ? { limit?: number } : { take?: number };

  /**
   * Get the pagination result based on the given table metadata.
   */
  export type Result<E extends DatabaseEngine> = EngineUtils.GetPaginationMode<E> extends PaginationMode.Cursor ? { cursor?: string } : {};
}
