/**
 * This constant MUST be defined by the bundler.
 */
declare const EZ4_IS_REMOTE_RUNTIME: boolean;

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
    globalScope = {
      ...scope
    };
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
   * Check whether the current runtime is remote.
   *
   * @returns Returns `true` when the current runtime is remote, `false` otherwise.
   */
  export const isRemote = () => {
    return typeof EZ4_IS_REMOTE_RUNTIME !== 'undefined' ? true : false;
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
