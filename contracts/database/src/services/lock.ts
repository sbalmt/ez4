import type { TableMetadata } from './table';

/**
 * Lock mode.
 */
export const enum LockMode {
  Unsupported = 'unsupported',
  Supported = 'supported'
}

/**
 * Lock mode utils.
 */
export namespace LockModeUtils {
  /**
   * Lock mode input type based on the table metadata.
   */
  export type Input<T extends TableMetadata> = T['engine']['lockMode'] extends LockMode.Unsupported ? never : boolean;
}
