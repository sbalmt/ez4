import type { ArchitectureType, RuntimeType } from '@ez4/project';
import type { LinkedVariables } from '@ez4/project/library';
import type { Arn, Logger, ResourceTags } from '@ez4/aws-common';

import {
  LambdaClient,
  GetFunctionCommand,
  CreateFunctionCommand,
  DeleteFunctionCommand,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
  PublishVersionCommand,
  TagResourceCommand,
  UntagResourceCommand,
  waitUntilFunctionActive,
  waitUntilFunctionUpdated,
  waitUntilPublishedVersionActive,
  ResourceNotFoundException,
  ApplicationLogLevel,
  SystemLogLevel,
  LogFormat
} from '@aws-sdk/client-lambda';

import { waitCreation, waitDeletion } from '@ez4/aws-common';

import { getFunctionRuntime } from '../utils/runtime';
import { getFunctionArchitecture } from '../utils/architecture';
import { assertVariables } from './helpers/variables';
import { getZipBuffer } from './helpers/zip';

const client = new LambdaClient({});

const waiter = {
  minDelay: 15,
  maxWaitTime: 1800,
  maxDelay: 60,
  client
};

export type CreateRequest = {
  roleArn: Arn;
  sourceFile: string;
  functionName: string;
  handlerName: string;
  description?: string;
  logGroup?: string;
  variables?: LinkedVariables;
  architecture: ArchitectureType;
  runtime: RuntimeType;
  timeout?: number;
  memory?: number;
  publish?: boolean;
  debug?: boolean;
  tags?: ResourceTags;
};

export type ImportOrCreateResponse = {
  functionVersion?: string;
  functionArn: Arn;
};

export type UpdateConfigurationRequest = {
  roleArn?: Arn;
  handlerName?: string;
  description?: string;
  logGroup?: string;
  variables?: LinkedVariables;
  runtime?: RuntimeType;
  timeout?: number;
  memory?: number;
  debug?: boolean;
};

export type UpdateSourceCodeRequest = {
  architecture?: ArchitectureType;
  sourceFile: string;
  publish?: boolean;
};

export const importFunction = async (
  logger: Logger.OperationLogger,
  functionName: string,
  version?: string
): Promise<ImportOrCreateResponse | undefined> => {
  logger.update(`Importing function`);

  try {
    const response = await client.send(
      new GetFunctionCommand({
        FunctionName: functionName,
        Qualifier: version
      })
    );

    const functionVersion = response.Configuration!.Version;
    const functionArn = response.Configuration!.FunctionArn as Arn;

    return {
      functionVersion,
      functionArn
    };
  } catch (error) {
    if (!(error instanceof ResourceNotFoundException)) {
      throw error;
    }

    return undefined;
  }
};

export const createFunction = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  logger.update(`Creating function`);

  const { functionName, variables } = request;

  if (variables) {
    assertVariables(variables);
  }

  const handlerName = getSourceHandlerName(request.handlerName);
  const sourceFile = await getSourceZipFile(request.sourceFile);

  const { description, memory, timeout, architecture, runtime, debug, roleArn, logGroup } = request;

  // If the given roleArn is new and still propagating on AWS, the creation will fail.
  // The `waitCreation` will keep retrying until max attempts.
  const response = await waitCreation(() => {
    return client.send(
      new CreateFunctionCommand({
        FunctionName: functionName,
        Description: description,
        MemorySize: memory,
        Timeout: timeout,
        Role: roleArn,
        Handler: handlerName,
        Architectures: [getFunctionArchitecture(architecture)],
        Runtime: getFunctionRuntime(runtime),
        PackageType: 'Zip',
        LoggingConfig: {
          LogGroup: logGroup,
          ApplicationLogLevel: debug ? ApplicationLogLevel.Debug : ApplicationLogLevel.Warn,
          SystemLogLevel: SystemLogLevel.Warn,
          LogFormat: LogFormat.Json
        },
        Code: {
          ZipFile: sourceFile
        },
        Environment: {
          Variables: variables
        },
        Tags: {
          ...request.tags,
          ManagedBy: 'EZ4'
        }
      })
    );
  });

  await waitUntilFunctionActive(waiter, {
    FunctionName: functionName
  });

  const functionArn = response.FunctionArn as Arn;

  if (request.publish) {
    const functionVersion = await publishFunction(functionName, logger);

    return {
      functionVersion,
      functionArn
    };
  }

  return {
    functionArn
  };
};

export const updateSourceCode = async (logger: Logger.OperationLogger, functionName: string, request: UpdateSourceCodeRequest) => {
  logger.update(`Updating source code`);

  const sourceFile = await getSourceZipFile(request.sourceFile);

  const { publish, architecture } = request;

  const response = await client.send(
    new UpdateFunctionCodeCommand({
      Architectures: architecture && [getFunctionArchitecture(architecture)],
      FunctionName: functionName,
      ZipFile: sourceFile,
      Publish: publish
    })
  );

  await waitUntilFunctionUpdated(waiter, {
    FunctionName: functionName
  });

  const functionArn = response.FunctionArn as Arn;

  if (request.publish) {
    const functionVersion = await publishFunction(functionName, logger);

    return {
      functionVersion,
      functionArn
    };
  }

  return {
    functionArn
  };
};

export const updateConfiguration = async (logger: Logger.OperationLogger, functionName: string, request: UpdateConfigurationRequest) => {
  logger.update(`Updating configuration`);

  const { handlerName, variables } = request;

  if (variables) {
    assertVariables(variables);
  }

  const { description, memory, timeout, runtime, debug, roleArn, logGroup } = request;

  await client.send(
    new UpdateFunctionConfigurationCommand({
      Runtime: runtime && getFunctionRuntime(runtime),
      FunctionName: functionName,
      Description: description,
      MemorySize: memory,
      Timeout: timeout,
      Role: roleArn,
      ...(handlerName && {
        Handler: getSourceHandlerName(handlerName)
      }),
      LoggingConfig: {
        LogGroup: logGroup,
        ApplicationLogLevel: debug ? ApplicationLogLevel.Debug : ApplicationLogLevel.Warn,
        SystemLogLevel: SystemLogLevel.Warn,
        LogFormat: LogFormat.Json
      },
      Environment: {
        Variables: variables
      }
    })
  );

  await waitUntilFunctionUpdated(waiter, {
    FunctionName: functionName
  });
};

export const deleteFunction = async (functionName: string, logger: Logger.OperationLogger) => {
  logger.update(`Deleting function`);

  // If the function is still in use due to a prior change that's not
  // done yet, keep retrying until max attempts.
  await waitDeletion(async () => {
    try {
      await client.send(
        new DeleteFunctionCommand({
          FunctionName: functionName
        })
      );
    } catch (error) {
      if (!(error instanceof ResourceNotFoundException)) {
        throw error;
      }
    }
  });
};

export const publishFunction = async (functionName: string, logger: Logger.OperationLogger) => {
  logger.update(`Publishing version`);

  const response = await client.send(
    new PublishVersionCommand({
      FunctionName: functionName
    })
  );

  const version = response.Version;

  await waitUntilPublishedVersionActive(waiter, {
    FunctionName: functionName,
    Qualifier: version
  });

  return version;
};

export const tagFunction = async (logger: Logger.OperationLogger, functionArn: Arn, tags: ResourceTags) => {
  logger.update(`Tag function`);

  await client.send(
    new TagResourceCommand({
      Resource: functionArn,
      Tags: {
        ...tags,
        ManagedBy: 'EZ4'
      }
    })
  );
};

export const untagFunction = async (logger: Logger.OperationLogger, functionArn: Arn, tagKeys: string[]) => {
  logger.update(`Untag function`);

  await client.send(
    new UntagResourceCommand({
      Resource: functionArn,
      TagKeys: tagKeys
    })
  );
};

const getSourceZipFile = (sourceFile: string) => {
  return getZipBuffer(sourceFile, `main.mjs`);
};

const getSourceHandlerName = (handlerName: string) => {
  return `main.${handlerName}`;
};
