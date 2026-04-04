/**
 * Determines whether or not the handler is running in a debug runtime.
 * !! IT MUST BE DEFINED BY THE BUNDLER !!
 */
declare const EZ4_IS_DEBUG_RUNTIME: boolean;

/**
 * Determines whether or not the handler is running at a remote runtime.
 * !! IT MUST BE DEFINED BY THE BUNDLER !!
 */
declare const EZ4_IS_REMOTE_RUNTIME: boolean;

/**
 * Hold the handler function's name.
 * !! IT MUST BE DEFINED BY THE BUNDLER !!
 */
declare const EZ4_HANDLER_NAME: string;

/**
 * Access to the current runtime settings.
 */
export namespace Runtime {
  let globalScope: Scope | undefined;

  export type Scope = {
    traceId: string;
  };

  /**
   * Set the new common runtime scope.
   *
   * @param scope New scope object.
   */
  export const setScope = (scope: Scope) => {
    globalScope = Object.seal({
      ...scope
    });
  };

  /**
   * Get the current common runtime scope.
   *
   * @returns Returns the current common runtime scope.
   */
  export const getScope = () => {
    return globalScope;
  };

  /**
   * Get the handler function name.
   *
   * @returns Returns the function name.
   */
  export const getHandlerName = () => {
    return typeof EZ4_HANDLER_NAME === 'string' ? EZ4_HANDLER_NAME : 'unknown';
  };

  /**
   * Check whether the current runtime is debug.
   *
   * @returns Returns `true` when the current runtime is debug, `false` otherwise.
   */
  export const isDebug = () => {
    return typeof EZ4_IS_DEBUG_RUNTIME !== 'undefined';
  };

  /**
   * Check whether the current runtime is remote.
   *
   * @returns Returns `true` when the current runtime is remote, `false` otherwise.
   */
  export const isRemote = () => {
    return typeof EZ4_IS_REMOTE_RUNTIME !== 'undefined';
  };

  /**
   * Check whether the current runtime is local.
   *
   * @returns Returns `true` when the current runtime is local, `false` otherwise.
   */
  export const isLocal = () => {
    return !isRemote();
  };
}
