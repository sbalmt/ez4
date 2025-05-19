import type { EngineUtils } from './engine.js';
import type { Database } from './database.js';

/**
 * Parameters mode.
 */
export const enum ParametersMode {
  NameAndIndex = 'both',
  OnlyIndex = 'index'
}

/**
 * Parameters utils.
 */
export namespace ParametersUtils {
  /**
   * Determines the parameters mode based on the given database service.
   */
  export type Type<T extends Database.Service> =
    EngineUtils.GetParametersMode<T> extends ParametersMode.NameAndIndex ? unknown[] | Record<string, unknown> : unknown[];
}
