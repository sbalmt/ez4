import type { AnyObject, IsUndefined } from '@ez4/utils';
import type { UndefinedMode } from '../types/mode';
import type { DatabaseEngine, EngineUtils } from './engine';

/**
 * Undefined value mode utilities.
 */
export namespace UndefinedModeUtils {
  /**
   * Get select output fields for the given database engine.
   */
  export type Output<T extends AnyObject, E extends DatabaseEngine> =
    EngineUtils.GetUndefinedMode<E> extends UndefinedMode.Unsupported ? Result<T> : T;

  /**
   * Get select output fields with undefined mode unsupported.
   */
  export type Result<T extends AnyObject> = {
    [P in keyof T]-?: IsUndefined<T[P]> extends true ? Exclude<T[P], undefined> | null : T[P];
  };
}
