import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { Variables } from '../types/variables.js';

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

import { assertVariables } from './helpers/variables.js';
import { getZipBuffer } from './helpers/zip.js';
import { FunctionServiceName } from './types.js';

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
  variables?: Variables;
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
  variables?: Variables;
  timeout?: number;
  memory?: number;
  debug?: boolean;
};

export type UpdateSourceCodeRequest = {
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

  // If the given roleArn is new and still propagating on AWS, the creation
  // will fail, `waitFor` will keep retrying until max attempts.
  const response = await waitCreation(() => {
    return client.send(
      new CreateFunctionCommand({
        FunctionName: request.functionName,
        Description: request.description,
        MemorySize: request.memory,
        Timeout: request.timeout,
        Role: request.roleArn,
        Handler: handlerName,
        Runtime: 'nodejs22.x',
        PackageType: 'Zip',
        LoggingConfig: {
          LogGroup: request.logGroup,
          ApplicationLogLevel: request.debug ? ApplicationLogLevel.Debug : ApplicationLogLevel.Warn,
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

  const response = await client.send(
    new UpdateFunctionCodeCommand({
      FunctionName: functionName,
      Publish: request.publish,
      ZipFile: sourceFile
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

  await client.send(
    new UpdateFunctionConfigurationCommand({
      FunctionName: functionName,
      Description: request.description,
      MemorySize: request.memory,
      Timeout: request.timeout,
      Role: request.roleArn,
      Runtime: 'nodejs22.x',
      ...(handlerName && {
        Handler: getSourceHandlerName(handlerName)
      }),
      LoggingConfig: {
        LogGroup: request.logGroup,
        ApplicationLogLevel: request.debug ? ApplicationLogLevel.Debug : ApplicationLogLevel.Warn,
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

      return true;
    } catch (error) {
      if (!(error instanceof ResourceNotFoundException)) {
        throw error;
      }

      return false;
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
