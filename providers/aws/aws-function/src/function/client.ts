import type { ServiceArchitecture, ServiceRuntime } from '@ez4/common';
import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { FunctionVariables } from '../types/variables';

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

import { Logger, tryParseArn, waitCreation, waitDeletion } from '@ez4/aws-common';

import { getFunctionRuntime } from '../utils/runtime';
import { getFunctionArchitecture } from '../utils/architecture';
import { assertVariables } from './helpers/variables';
import { getZipBuffer } from './helpers/zip';
import { FunctionServiceName } from './types';

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
  variables?: FunctionVariables;
  architecture: ServiceArchitecture;
  runtime: ServiceRuntime;
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
  variables?: FunctionVariables;
  runtime?: ServiceRuntime;
  timeout?: number;
  memory?: number;
  debug?: boolean;
};

export type UpdateSourceCodeRequest = {
  architecture?: ServiceArchitecture;
  sourceFile: string;
  publish?: boolean;
};

export const importFunction = async (functionName: string, version?: string): Promise<ImportOrCreateResponse | undefined> => {
  Logger.logImport(FunctionServiceName, functionName);

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

export const createFunction = async (request: CreateRequest): Promise<ImportOrCreateResponse> => {
  const { functionName, variables } = request;

  Logger.logCreate(FunctionServiceName, functionName);

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

  Logger.logWait(FunctionServiceName, functionName);

  await waitUntilFunctionActive(waiter, {
    FunctionName: functionName
  });

  const functionArn = response.FunctionArn as Arn;

  if (request.publish) {
    const functionVersion = await publishFunction(functionName);

    return {
      functionVersion,
      functionArn
    };
  }

  return {
    functionArn
  };
};

export const updateSourceCode = async (functionName: string, request: UpdateSourceCodeRequest) => {
  Logger.logUpdate(FunctionServiceName, `${functionName} source code`);

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

  Logger.logWait(FunctionServiceName, functionName);

  await waitUntilFunctionUpdated(waiter, {
    FunctionName: functionName
  });

  const functionArn = response.FunctionArn as Arn;

  if (request.publish) {
    const functionVersion = await publishFunction(functionName);

    return {
      functionVersion,
      functionArn
    };
  }

  return {
    functionArn
  };
};

export const updateConfiguration = async (functionName: string, request: UpdateConfigurationRequest) => {
  const { handlerName, variables } = request;

  Logger.logUpdate(FunctionServiceName, `${functionName} configuration`);

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

  Logger.logWait(FunctionServiceName, functionName);

  await waitUntilFunctionUpdated(waiter, {
    FunctionName: functionName
  });
};

export const deleteFunction = async (functionName: string) => {
  Logger.logDelete(FunctionServiceName, functionName);

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

export const publishFunction = async (functionName: string) => {
  Logger.logPublish(FunctionServiceName, functionName);

  const response = await client.send(
    new PublishVersionCommand({
      FunctionName: functionName
    })
  );

  Logger.logWait(FunctionServiceName, functionName);

  const version = response.Version;

  await waitUntilPublishedVersionActive(waiter, {
    FunctionName: functionName,
    Qualifier: version
  });

  return version;
};

export const tagFunction = async (functionArn: Arn, tags: ResourceTags) => {
  const functionName = tryParseArn(functionArn)?.resourceName ?? functionArn;

  Logger.logTag(FunctionServiceName, functionName);

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

export const untagFunction = async (functionArn: Arn, tagKeys: string[]) => {
  const functionName = tryParseArn(functionArn)?.resourceName ?? functionArn;

  Logger.logUntag(FunctionServiceName, functionName);

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
