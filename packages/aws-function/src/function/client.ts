import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { Variables } from '../types/variables.js';

import {
  CreateFunctionCommand,
  DeleteFunctionCommand,
  LambdaClient,
  TagResourceCommand,
  UntagResourceCommand,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
  waitUntilFunctionActive,
  waitUntilFunctionUpdated
} from '@aws-sdk/client-lambda';

import { Logger } from '@ez4/aws-common';

import { assertVariables } from './helpers/variables.js';
import { getZipBuffer } from './helpers/zip.js';
import { FunctionServiceName } from './types.js';

const client = new LambdaClient({});

const waiter = {
  maxWaitTime: 90,
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

export type CreateResponse = {
  functionArn: Arn;
  functionName: string;
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

export const createFunction = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(FunctionServiceName, request.functionName);

  if (request.variables) {
    assertVariables(request.variables);
  }

  const response = await client.send(
    new CreateFunctionCommand({
      Publish: true,
      FunctionName: request.functionName,
      Description: request.description,
      MemorySize: request.memory,
      Timeout: request.timeout,
      Role: request.roleArn,
      PackageType: 'Zip',
      Handler: getSourceHandlerName(request.handlerName),
      Runtime: 'nodejs20.x',
      Code: {
        ZipFile: await getSourceZipFile(request.sourceFile)
      },
      Environment: {
        Variables: request.variables
      },
      Tags: {
        ...request.tags,
        ManagedBy: 'EZ4'
      }
    })
  );

  const functionName = response.FunctionName!;
  const functionArn = response.FunctionArn as Arn;

  await waitUntilFunctionActive(waiter, { FunctionName: functionName });

  return {
    functionName,
    functionArn
  };
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

  await waitUntilFunctionUpdated(waiter, { FunctionName: functionName });
};

export const updateConfiguration = async (functionName: string, request: UpdateConfigRequest) => {
  Logger.logUpdate(FunctionServiceName, `${functionName} configuration`);

  if (request.variables) {
    assertVariables(request.variables);
  }

  const { handlerName } = request;

  await client.send(
    new UpdateFunctionConfigurationCommand({
      FunctionName: functionName,
      Description: request.description,
      MemorySize: request.memory,
      Timeout: request.timeout,
      Role: request.roleArn,
      ...(handlerName && {
        Handler: getSourceHandlerName(handlerName)
      }),
      Environment: {
        Variables: request.variables
      }
    })
  );

  await waitUntilFunctionUpdated(waiter, { FunctionName: functionName });
};

export const deleteFunction = async (functionName: string) => {
  Logger.logDelete(FunctionServiceName, functionName);

  await client.send(
    new DeleteFunctionCommand({
      FunctionName: functionName
    })
  );
};

const getSourceZipFile = (sourceFile: string) => {
  return getZipBuffer(sourceFile, `main.mjs`);
};

const getSourceHandlerName = (handlerName: string) => {
  return `main.${handlerName}`;
};
