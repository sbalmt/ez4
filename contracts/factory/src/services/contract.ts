import type { LinkedVariables } from '@ez4/project/library';
import type { Service as CommonService } from '@ez4/common';
import type { FactoryHandler } from './handler';

export namespace Factory {
  /**
   * Handler function for the factory.
   */
  export type Handler<T = void> = FactoryHandler<T>;

  /**
   * Factory service.
   */
  export declare abstract class Service<T = void> implements CommonService.Provider {
    /**
     * Define factory handler function.
     */
    abstract readonly handler: Handler<T>;

    /**
     * Variables associated to the factory.
     */
    readonly variables?: LinkedVariables;

    /**
     * Service instance.
     */
    readonly client: T;
  }
}
