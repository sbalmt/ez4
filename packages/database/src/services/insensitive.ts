import type { TableMetadata } from './table.js';
import type { EngineUtils } from './engine.js';

/**
 * Insensitive mode.
 */
export const enum InsensitiveMode {
  Unsupported = 'unsupported',
  Enabled = 'enabled'
}

/**
 * Insensitive utils.
 */
export namespace InsensitiveUtils {
  /**
   * Get the insensitive input based on the given table metadata.
   */
  export type Input<T extends TableMetadata> =
    EngineUtils.GetInsensitiveMode<T> extends InsensitiveMode.Enabled ? { insensitive?: boolean } : {};
}
