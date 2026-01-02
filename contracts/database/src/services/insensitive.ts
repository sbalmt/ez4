import type { InsensitiveMode } from '../types/mode';
import type { DatabaseEngine, EngineUtils } from './engine';

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
