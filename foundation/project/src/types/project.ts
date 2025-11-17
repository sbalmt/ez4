import type { AnyObject } from '@ez4/utils';
import type { LinkedVariables } from './service';

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
  confirmMode?: boolean;

  /**
   * Determine whether the debug mode is active for the project.
   * Default is: `false`
   */
  debugMode?: boolean;

  /**
   * Determines whether the deploy and destroy commands are forced.
   * Default is: `false`
   */
  forceMode?: boolean;

  /**
   * Determines whether the serve and test commands must use the `localOptions`.
   * Default is: `false`
   */
  localMode?: boolean;

  /**
   * Determines whether the serve and test commands must reset local resources.
   * Default is: `false`
   */
  resetMode?: boolean;

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
   * Set a new `tsconfig.json` location relative to the current working directory.
   */
  tsconfigFile?: string;

  /**
   * List of source files containing declarative resources.
   */
  sourceFiles: string[];

  /**
   * Configuration for the project state.
   */
  stateFile: ProjectStateOptions;

  /**
   * Configuration for imported projects.
   */
  importProjects?: Record<string, ProjectImportOptions>;

  /**
   * Configuration for custom providers.
   */
  customProviders?: ProjectCustomProviders;

  /**
   * Options for serving the local development.
   */
  serveOptions?: ProjectServeOptions;

  /**
   * Options for watching the local development.
   */
  watchOptions?: ProjectWatchOptions;

  /**
   * Options for local development.
   */
  localOptions?: Record<string, AnyObject>;

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

export type ProjectImportOptions = {
  /**
   * Project options file path.
   */
  projectFile: string;
};

export type ProjectCustomProviders = {
  /**
   * Specify all the custom provider packages.
   */
  packages: string[];
};

export type ProjectServeOptions = {
  /**
   * Port to run the local development service.
   * Default is: `3734`
   */
  localPort?: number;

  /**
   * Host to run the local development server.
   * Default is: `localhost`
   */
  localHost?: string;
};

export type ProjectWatchOptions = {
  /**
   * Specify additional watch paths.
   */
  additionalPaths: string[];
};
