import type { LinkedVariables } from './service.js';

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
   * Determine whether the debug mode is active for the project.
   * Default is: `false`
   */
  debugMode?: boolean;

  /**
   * Determines whether the deploy and destroy actions are forced.
   * Default is: `false`
   */
  forceMode?: boolean;

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

  /**
   * Variables associated to all services.
   */
  variables?: LinkedVariables;

  /**
   * Tags associated to all services.
   */
  tags?: Record<string, string>;
};

/**
 * Project state options.
 */
export type ProjectStateOptions = {
  /**
   * Determines whether the state file is stored remotely.
   * Default is: `false`
   */
  remote?: boolean;

  /**
   * Path to the state file (don't specify the file extension).
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
