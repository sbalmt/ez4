# EZ4: Configuration

The project configuration is held by the `ez4.project.js`, and every project that needs to have a separate deploy shall have its own file. It's recommended that the configuration file be placed at the project root folder.

## Getting started

The file needs to look like the one below; you can pick only the properties that make sense for your project.

```js
import { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';

/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'dev', // Project prefix
  projectName: 'backend', // Project name (required)
  sourceFiles: ['./src/api.ts'], // Entry-point source files

  tsconfigFile: 'tsconfig.json', // Specify a new tsconfig.json location
  packageFile: 'package.json', // Specify a new package.json location

  confirmMode: true, // Ask for deploy confirmation when it's true
  debugMode: true, // See more logs when serving and in the deployed resources
  localMode: true, // Enable the local mode for the resources when serving
  resetMode: true, // Enable the reset mode for the local resources when serving

  // Configure how the state file is stored
  stateFile: {
    path: 'ez4-state', // Path to the state file
    remote: true // Enable remote storage (in your cloud account) for the state file
  },

  // Configure the default options for all resource contracts
  defaultOptions: {
    logLevel: LogLevel.Debug, // Default log level for all handlers
    logRetention: 15, // Default log retention (in days) for all handlers
    architecture: ArchitectureType.Arm, // Default architecture for all handlers
    runtime: RuntimeType.Node24, // Default runtime for all handlers
    memory: 192 // Default amount of memory available (in megabytes) for all handlers
  },

  // Configure the deployment options for all resources
  deployOptions: {
    maxConcurrency: 10, // Maximum amount of resource changes at the same time.

    // Configure the deployment release
    release: {
      tagName: 'Version', // Name of the tag to hold the release version
      variableName: 'VERSION', // Name of the environment variable to hold the release version
      version: '0.0.0' // Current release version
    }
  },

  // Configure how to serve the project locally
  serveOptions: {
    localHost: 'localhost', // Host name/address when serving the project
    localPort: 3734 // Port when serving the project
  },

  // Configure the watch mode for when serving the project
  watchOptions: {
    additionalPaths: ['./test'] // Configure extra watch paths
  },

  // Configure the local development options for the providers
  localOptions: {},

  // Configure the test options for the providers
  testOptions: {},

  // Environment variables shared with all resources
  variables: {
    DUMMY_API_KEY: 'A-BC123'
  },

  // Tags shared with all resources
  tags: {
    Project: 'EZ4' // Use the tag name/value key pair
  },

  // Configure the imported projects
  importProjects: {
    // Identification key for the imported project
    another_project: {
      projectFile: '../frontend/ez4.project.js' // Path to the EZ4's configuration
    }
  },

  // Configure the custom providers
  customProviders: {
    packages: ['@my-project/custom'] // List of installed package that have custom providers
  }
};
```

## Examples

- [Storage manager](../examples/aws-storage-manager)
- [Schedule manager](../examples/aws-schedule-manager)
- [Importing gateway](../examples/aws-import-gateway)
- [Importing queue](../examples/aws-import-queue)
- [Importing topic](../examples/aws-import-topic)

## License

MIT License
