import type { LinkedVariables } from '@ez4/project/library';
import type { Service as CommonService } from '@ez4/common';
import type { ValidationHandler } from './handler';
import type { ValidationInput } from './input';
import type { Client } from './client';

export namespace Validation {
  /**
   * Handler function for the validation.
   */
  export type Handler<T> = ValidationHandler<T>;

  /**
   * Validation input.
   */
  export type Input<T> = ValidationInput<T>;

  /**
   * Validation service.
   */
  export declare abstract class Service<T> implements CommonService.Provider {
    /**
     * Define the validation handler function.
     */
    abstract readonly handler: Handler<T>;

    /**
     * Validation schema.
     */
    readonly schema: T;

    /**
     * Variables associated to the validation.
     */
    readonly variables?: LinkedVariables;

    /**
     * Service instance.
     */
    readonly client: Client;
  }
}
