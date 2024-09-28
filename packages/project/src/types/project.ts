/**
 * Project options.
 */
export type ProjectOptions = {
  /**
   * Prefix to be used as part of the resource names.
   * Default is: `ez4`
   */
  prefix?: string;

  /**
   * Determine whether the deployment must be confirmed before proceeding.
   * Default is: `true`
   */
  confirm?: boolean;

  /**
   * Project name that's combined with the `prefix`.
   */
  projectName: string;

  /**
   * Set a new `package.json` location relative to the current working directory.
   * All providers are automatically loaded from this new package location.
   */
  packageFile?: string;

  /**
   * List of source files containing declarative resources.
   */
  sourceFiles: string[];

  /**
   * Configuration for imported projects.
   */
  importProjects?: Record<string, ProjectImportOptions>;

  /**
   * Configuration for the project state.
   */
  stateFile: ProjectStateOptions;
};

/**
 * Project state options.
 */
export type ProjectStateOptions = {
  /**
   * Path to the local state file (don't use file extension).
   */
  path: string;
};

/**
 * Project import options.
 */
export type ProjectImportOptions = {
  /**
   * Project options file path.
   */
  projectFile: string;
};
