import type { DatabaseEngine } from './engine.js';

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
   * Get the pagination input based on the given database engine.
   */
  export type Input<E extends DatabaseEngine> = E['paginationMode'] extends PaginationMode.Cursor
    ? { cursor?: string; limit?: number }
    : { skip?: number; take?: number };

  /**
   * Get the pagination result based on the given database engine.
   */
  export type Result<E extends DatabaseEngine> = E['paginationMode'] extends PaginationMode.Cursor ? { cursor?: string } : {};
}
