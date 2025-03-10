import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { Variables } from '../types/variables.js';

import {
  LambdaClient,
  GetFunctionCommand,
  CreateFunctionCommand,
  DeleteFunctionCommand,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
  TagResourceCommand,
  UntagResourceCommand,
  waitUntilFunctionActive,
  waitUntilFunctionUpdated,
  ResourceNotFoundException
} from '@aws-sdk/client-lambda';

import { Logger } from '@ez4/aws-common';

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
  variables?: Variables;
  timeout?: number;
  memory?: number;
  tags?: ResourceTags;
};

export type ImportOrCreateResponse = {
  functionArn: Arn;
};

export type UpdateConfigRequest = {
  roleArn?: Arn;
  handlerName?: string;
  description?: string;
  variables?: Variables;
  timeout?: number;
  memory?: number;
};

export type UpdateSourceCodeRequest = {
  sourceFile: string;
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

    const functionArn = response.Configuration!.FunctionArn as Arn;

    return {
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

  const { description, memory, timeout, roleArn, handlerName, sourceFile, tags } = request;

  const response = await client.send(
    new CreateFunctionCommand({
      Publish: true,
      FunctionName: functionName,
      Description: description,
      MemorySize: memory,
      Timeout: timeout,
      Role: roleArn,
      Handler: getSourceHandlerName(handlerName),
      Runtime: 'nodejs22.x',
      PackageType: 'Zip',
      Code: {
        ZipFile: await getSourceZipFile(sourceFile)
      },
      Environment: {
        Variables: variables
      },
      Tags: {
        ...tags,
        ManagedBy: 'EZ4'
      }
    })
  );

  const functionArn = response.FunctionArn as Arn;

  Logger.logWait(FunctionServiceName, functionName);

  await waitUntilFunctionActive(waiter, {
    FunctionName: functionName
  });

  return {
    functionArn
  };
};

export const updateSourceCode = async (functionName: string, request: UpdateSourceCodeRequest) => {
  Logger.logUpdate(FunctionServiceName, `${functionName} source code`);

  const { sourceFile } = request;

  await client.send(
    new UpdateFunctionCodeCommand({
      FunctionName: functionName,
      ZipFile: await getSourceZipFile(sourceFile),
      Publish: true
    })
  );

  Logger.logWait(FunctionServiceName, functionName);

  await waitUntilFunctionUpdated(waiter, {
    FunctionName: functionName
  });
};

export const updateConfiguration = async (functionName: string, request: UpdateConfigRequest) => {
  const { variables } = request;

  Logger.logUpdate(FunctionServiceName, `${functionName} configuration`);

  if (variables) {
    assertVariables(variables);
  }

  const { description, memory, timeout, roleArn, handlerName } = request;

  await client.send(
    new UpdateFunctionConfigurationCommand({
      FunctionName: functionName,
      Description: description,
      MemorySize: memory,
      Timeout: timeout,
      Role: roleArn,
      ...(handlerName && {
        Handler: getSourceHandlerName(handlerName)
      }),
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
};

export const tagFunction = async (functionArn: Arn, tags: ResourceTags) => {
  Logger.logTag(FunctionServiceName, functionArn);

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
  Logger.logUntag(FunctionServiceName, functionArn);

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
