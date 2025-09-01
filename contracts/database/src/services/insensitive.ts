import type { DatabaseEngine, EngineUtils } from './engine';

/**
 * Insensitive mode.
 */
export const enum InsensitiveMode {
  Unsupported = 'unsupported',
  Enabled = 'enabled'
}

/**
 * Insensitive mode utils.
 */
export namespace InsensitiveModeUtils {
  /**
   * Get the insensitive input based on the given database engine.
   */
  export type Input<E extends DatabaseEngine> =
    EngineUtils.GetInsensitiveMode<E> extends InsensitiveMode.Enabled ? { insensitive?: boolean } : {};
}
