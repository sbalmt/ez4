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
 * Hold the handler's runtime resource name.
 * !! IT MUST BE DEFINED BY THE BUNDLER !!
 */
declare const EZ4_RESOURCE_NAME: string;

/**
 * Hold the project name.
 * !! IT MUST BE DEFINED BY THE BUNDLER !!
 */
declare const EZ4_PROJECT_NAME: string;

/**
 * Hold the project branch name.
 * !! IT MUST BE DEFINED BY THE BUNDLER !!
 */
declare const EZ4_PROJECT_BRANCH: string;

/**
 * Hold the project prefix.
 * !! IT MUST BE DEFINED BY THE BUNDLER !!
 */
declare const EZ4_PROJECT_PREFIX: string;

/**
 * Hold the cold start flag for the runtime context.
 */
let IS_COLD_START = true;

/**
 * Access to the current runtime settings.
 */
export namespace Runtime {
  let globalScope: Scope | undefined;
  let globalResourceId = 'unknown';
  let coldStartFlag = false;

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
   * Initialize runtime state for the current invocation.
   * Call once at the beginning of each invocation.
   */
  export const initialize = (resourceId: string) => {
    globalResourceId = resourceId;
    coldStartFlag = IS_COLD_START;
    IS_COLD_START = false;
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
   * Check whether the cold start happened for the current invocation.
   *
   * @returns Return `true` when the cold start happened, `false` otherwise.
   */
  export const isColdStart = () => {
    return coldStartFlag;
  };

  /**
   * Get the runtime resource name.
   *
   * @returns Returns the resource name.
   */
  export const getResourceName = () => {
    return typeof EZ4_RESOURCE_NAME === 'string' ? EZ4_RESOURCE_NAME : 'unknown';
  };

  /**
   * Get the runtime resource ID.
   *
   * @returns Returns the resource ID.
   */
  export const getResourceId = () => {
    return globalResourceId;
  };

  /**
   * Get the project name.
   *
   * @returns Returns the project name.
   */
  export const getProjectName = () => {
    return typeof EZ4_PROJECT_NAME === 'string' ? EZ4_PROJECT_NAME : 'unknown';
  };

  /**
   * Get the project branch.
   *
   * @returns Returns the project branch.
   */
  export const getProjectBranch = () => {
    return typeof EZ4_PROJECT_BRANCH === 'string' ? EZ4_PROJECT_BRANCH : 'unknown';
  };

  /**
   * Get the project prefix.
   *
   * @returns Returns the project prefix.
   */
  export const getProjectPrefix = () => {
    return typeof EZ4_PROJECT_PREFIX === 'string' ? EZ4_PROJECT_PREFIX : 'unknown';
  };

  /**
   * Check whether the current runtime is debug.
   *
   * @returns Returns `true` when the current runtime is debug, `false` otherwise.
   */
  export const isDebug = () => {
    return typeof EZ4_IS_DEBUG_RUNTIME !== 'undefined' && !!EZ4_IS_DEBUG_RUNTIME;
  };

  /**
   * Check whether the current runtime is remote.
   *
   * @returns Returns `true` when the current runtime is remote, `false` otherwise.
   */
  export const isRemote = () => {
    return typeof EZ4_IS_REMOTE_RUNTIME !== 'undefined' && !!EZ4_IS_REMOTE_RUNTIME;
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
