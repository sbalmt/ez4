import type { EngineUtils } from './engine';
import type { Database } from './contract';

/**
 * Parameters mode.
 */
export const enum ParametersMode {
  NameAndIndex = 'both',
  OnlyIndex = 'index'
}

/**
 * Parameters mode utils.
 */
export namespace ParametersModeUtils {
  /**
   * Get the parameters type based on the given database service.
   */
  export type Type<T extends Database.Service> =
    EngineUtils.GetParametersMode<T> extends ParametersMode.NameAndIndex ? unknown[] | Record<string, unknown> : unknown[];
}
