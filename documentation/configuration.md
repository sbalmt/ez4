# EZ4: Configuration

EZ4 projects are configured through an `ez4.project.js` file. Each independently deployed project should have its own configuration file, typically placed at the project root.

## Getting started

The configuration file controls how EZ4 builds, deploys, and serves your project. It defines defaults for all resources, deployment behavior, local development settings, shared variables, and more. It can include any of the options shown below, and only the fields relevant to your project are required.

```js
import { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';

/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'dev', // Project prefix
  projectName: 'backend', // Project name (required)
  sourceFiles: ['./src/api.ts'], // Entry-point source files

  tsconfigFile: 'tsconfig.json', // Specify a custom tsconfig.json location
  packageFile: 'package.json', // Specify a custom package.json location

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
    maxConcurrency: 10, // Maximum number of resource changes processed concurrently.

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
    additionalPaths: ['./test'] // Additional paths to watch during development.
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

  // Configure the imported projects references
  references: {
    // Identification key for the imported project
    another_project: {
      projectFile: '../frontend/ez4.project.js' // Path to the EZ4's configuration
    }
  },

  // Configure the custom providers
  customProviders: {
    packages: ['@my-project/custom'] // List of installed packages that have custom providers
  }
};
```

With the configuration file in place, EZ4 knows how to build, deploy, and serve your project.

## Examples

- [Storage manager](../examples/aws-storage-manager)
- [Schedule manager](../examples/aws-schedule-manager)
- [Importing gateway](../examples/aws-import-gateway)
- [Importing queue](../examples/aws-import-queue)
- [Importing topic](../examples/aws-import-topic)

## License

MIT License
