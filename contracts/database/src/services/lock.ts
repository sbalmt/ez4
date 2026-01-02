import type { LockMode } from '../types/mode';
import type { TableMetadata } from './table';

/**
 * Lock mode utils.
 */
export namespace LockModeUtils {
  /**
   * Lock mode input type based on the table metadata.
   */
  export type Input<T extends TableMetadata> = T['engine']['lockMode'] extends LockMode.Unsupported ? never : boolean;
}
