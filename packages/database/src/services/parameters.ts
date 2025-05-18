import type { Database } from './database.js';
import type { Engine } from './engine.js';

/**
 * Parameters utils.
 */
export namespace Parameters {
  /**
   * Determines the parameters mode based on the given database service.
   */
  export type Type<T extends Database.Service> =
    Engine.GetParametersMode<T> extends Engine.ParametersMode.NameAndIndex ? unknown[] | Record<string, unknown> : unknown[];
}
