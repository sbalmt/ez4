import type { ParametersType } from './engine.js';
import type { Database } from './database.js';

/**
 * Parameters builder types.
 */
export namespace Parameters {
  /**
   * Determines the parameters type based on the given database service.
   */
  export type Type<T extends Database.Service> =
    EngineParametersType<T> extends ParametersType.NameAndIndex ? unknown[] | Record<string, unknown> : unknown[];

  /**
   * Extract the parameters from the given database service.
   */
  type EngineParametersType<T extends Database.Service> = T['engine'] extends { parameters: infer R } ? R : never;
}
