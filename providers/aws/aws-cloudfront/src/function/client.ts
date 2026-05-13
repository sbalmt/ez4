import type { Arn, OperationLogLine } from '@ez4/aws-common';

import {
  GetFunctionCommand,
  CreateFunctionCommand,
  UpdateFunctionCommand,
  DescribeFunctionCommand,
  PublishFunctionCommand,
  DeleteFunctionCommand,
  NoSuchFunctionExists,
  FunctionRuntime
} from '@aws-sdk/client-cloudfront';

import { getCloudFrontClient } from '../utils/deploy';

export type CreateRequest = {
  functionName: string;
  functionCode: Buffer;
  description?: string;
};

export type UpdateRequest = {
  functionCode: Buffer;
  description?: string;
};

export type ImportOrCreateResponse = {
  functionArn: Arn;
};

export const importFunction = async (logger: OperationLogLine, functionName: string): Promise<ImportOrCreateResponse | undefined> => {
  logger.update(`Importing function`);

  try {
    const response = await getCloudFrontClient().send(
      new DescribeFunctionCommand({
        Name: functionName
      })
    );

    const functionArn = response?.FunctionSummary?.FunctionMetadata?.FunctionARN as Arn;

    return {
      functionArn
    };
  } catch (error) {
    if (!(error instanceof NoSuchFunctionExists)) {
      throw error;
    }

    return undefined;
  }
};

export const createFunction = async (logger: OperationLogLine, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  logger.update(`Creating function`);

  const { functionName, functionCode, description } = request;

  const client = getCloudFrontClient();

  const response = await client.send(
    new CreateFunctionCommand({
      Name: functionName,
      FunctionCode: functionCode,
      FunctionConfig: {
        Runtime: FunctionRuntime.cloudfront_js_2_0,
        Comment: description
      }
    })
  );

  const functionArn = response.FunctionSummary?.FunctionMetadata?.FunctionARN as Arn;

  await publishFunction(logger, functionName, response.ETag);

  return {
    functionArn
  };
};

export const updateFunction = async (logger: OperationLogLine, functionName: string, request: UpdateRequest) => {
  const version = await getFunctionVersion(logger, functionName);

  logger.update(`Updating function`);

  const { functionCode, description } = request;

  const client = getCloudFrontClient();

  const response = await client.send(
    new UpdateFunctionCommand({
      Name: functionName,
      IfMatch: version,
      FunctionCode: functionCode,
      FunctionConfig: {
        Runtime: FunctionRuntime.cloudfront_js_2_0,
        Comment: description
      }
    })
  );

  await publishFunction(logger, functionName, response.ETag);
};

export const deleteFunction = async (logger: OperationLogLine, functionName: string) => {
  const version = await getFunctionVersion(logger, functionName);

  logger.update(`Deleting function`);

  await getCloudFrontClient().send(
    new DeleteFunctionCommand({
      Name: functionName,
      IfMatch: version
    })
  );
};

const getFunctionVersion = async (logger: OperationLogLine, functionName: string) => {
  logger.update(`Fetching distribution`);

  const response = await getCloudFrontClient().send(
    new GetFunctionCommand({
      Name: functionName
    })
  );

  return response.ETag;
};

const publishFunction = async (logger: OperationLogLine, functionName: string, functionVersion?: string) => {
  const version = functionVersion ?? (await getFunctionVersion(logger, functionName));

  logger.update(`Publishing function`);

  await getCloudFrontClient().send(
    new PublishFunctionCommand({
      IfMatch: version,
      Name: functionName
    })
  );
};
