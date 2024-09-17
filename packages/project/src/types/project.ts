/**
 * Project configuration options.
 */
export type ProjectOptions = {
  /**
   * Determine whether the deployment must be confirmed before proceeding.
   * Default is: `true`
   */
  confirmDeploy?: boolean;

  /**
   * Set a new `package.json` location relative to the current working directory.
   * All providers are automatically loaded from this new location.
   */
  packageLocation?: string;

  /**
   * Prefix to be used as part of the resource names.
   * Default is: `ez4`
   */
  resourcePrefix: string;

  /**
   * Project name that's combined with the `resourcePrefix`.
   */
  projectName: string;

  /**
   * Path to the local state file (don't use file extension).
   */
  stateFile: string;

  /**
   * List of source files containing resources to be applied.
   */
  sourceFiles: string[];
};
