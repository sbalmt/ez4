import type { Arn, OperationLogLine, ResourceTags } from '@ez4/aws-common';
import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { LinkedVariables } from '@ez4/project/library';

import {
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

import { getLambdaClient, getLambdaWaiter } from '../utils/deploy';
import { getFunctionArchitecture } from '../utils/architecture';
import { getFunctionRuntime } from '../utils/runtime';
import { FunctionDefaults } from '../utils/defaults';
import { assertVariables } from './helpers/variables';
import { getLogLevel } from './helpers/logging';
import { getZipBuffer } from './helpers/zip';
import { getDefaultVpcConfig } from './utils';

export type CreateRequest = {
  roleArn: Arn;
  files?: string[];
  sourceFile: string;
  functionName: string;
  handlerName: string;
  description?: string;
  logGroup?: string;
  logLevel?: LogLevel;
  variables?: LinkedVariables;
  architecture: ArchitectureType;
  runtime: RuntimeType;
  timeout?: number;
  memory?: number;
  publish?: boolean;
  debug?: boolean;
  vpc?: boolean;
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
  vpc?: boolean;
};

export type UpdateSourceCodeRequest = {
  files?: string[];
  sourceFile: string;
  architecture?: ArchitectureType;
  publish?: boolean;
};

export const importFunction = async (
  logger: OperationLogLine,
  functionName: string,
  version?: string
): Promise<ImportOrCreateResponse | undefined> => {
  logger.update(`Importing function`);

  try {
    const response = await getLambdaClient().send(
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

export const createFunction = async (logger: OperationLogLine, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  logger.update(`Creating function`);

  const { functionName, variables } = request;

  if (variables) {
    assertVariables(variables);
  }

  const vpcConfig = request.vpc ? await getDefaultVpcConfig() : undefined;

  const sourceFile = await getSourceZipFile(request.sourceFile, request.files);
  const handlerName = getSourceHandlerName(request.handlerName);

  const { description, memory, timeout, publish, architecture, runtime, debug, roleArn, logGroup, logLevel } = request;

  const client = getLambdaClient();

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
        Publish: publish,
        Handler: handlerName,
        Architectures: [getFunctionArchitecture(architecture)],
        Runtime: getFunctionRuntime(runtime),
        PackageType: 'Zip',
        VpcConfig: {
          SecurityGroupIds: vpcConfig ? [vpcConfig.securityGroupId] : [],
          SubnetIds: vpcConfig ? vpcConfig.subnetIds : []
        },
        LoggingConfig: {
          LogGroup: logGroup,
          ApplicationLogLevel: debug ? ApplicationLogLevel.Debug : getLogLevel(logLevel ?? FunctionDefaults.LogLevel),
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

  const functionArn = response.FunctionArn as Arn;
  const functionVersion = response.Version;

  const waiter = getLambdaWaiter(client);

  await waitUntilFunctionActive(waiter, {
    FunctionName: functionName
  });

  if (publish) {
    await waitUntilPublishedVersionActive(waiter, {
      FunctionName: functionName,
      Qualifier: functionVersion
    });
  }

  return {
    functionArn,
    ...(publish && {
      functionVersion
    })
  };
};

export const updateSourceCode = async (logger: OperationLogLine, functionName: string, request: UpdateSourceCodeRequest) => {
  logger.update(`Updating source code`);

  const sourceFile = await getSourceZipFile(request.sourceFile, request.files);

  const { publish, architecture } = request;

  const client = getLambdaClient();

  const response = await client.send(
    new UpdateFunctionCodeCommand({
      Architectures: architecture && [getFunctionArchitecture(architecture)],
      FunctionName: functionName,
      ZipFile: sourceFile,
      Publish: publish
    })
  );

  const functionArn = response.FunctionArn as Arn;
  const functionVersion = response.Version;

  const waiter = getLambdaWaiter(client);

  await waitUntilFunctionUpdated(waiter, {
    FunctionName: functionName
  });

  if (publish) {
    await waitUntilPublishedVersionActive(waiter, {
      FunctionName: functionName,
      Qualifier: functionVersion
    });
  }

  return {
    functionArn,
    ...(publish && {
      functionVersion
    })
  };
};

export const updateConfiguration = async (logger: OperationLogLine, functionName: string, request: UpdateConfigurationRequest) => {
  logger.update(`Updating configuration`);

  const { handlerName, variables } = request;

  if (variables) {
    assertVariables(variables);
  }

  const vpcConfig = request.vpc ? await getDefaultVpcConfig() : undefined;

  const { description, memory, timeout, runtime, debug, roleArn, logGroup } = request;

  const client = getLambdaClient();

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
      VpcConfig: {
        SecurityGroupIds: vpcConfig ? [vpcConfig.securityGroupId] : [],
        SubnetIds: vpcConfig ? vpcConfig.subnetIds : []
      },
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

  await waitUntilFunctionUpdated(getLambdaWaiter(client), {
    FunctionName: functionName
  });
};

export const deleteFunction = async (functionName: string, logger: OperationLogLine) => {
  logger.update(`Deleting function`);

  const client = getLambdaClient();

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

export const publishFunction = async (logger: OperationLogLine, functionName: string) => {
  logger.update(`Publishing version`);

  const client = getLambdaClient();

  const response = await client.send(
    new PublishVersionCommand({
      FunctionName: functionName
    })
  );

  const version = response.Version;

  await waitUntilPublishedVersionActive(getLambdaWaiter(client), {
    FunctionName: functionName,
    Qualifier: version
  });

  return version;
};

export const tagFunction = async (logger: OperationLogLine, functionArn: Arn, tags: ResourceTags) => {
  logger.update(`Tag function`);

  await getLambdaClient().send(
    new TagResourceCommand({
      Resource: functionArn,
      Tags: {
        ...tags,
        ManagedBy: 'EZ4'
      }
    })
  );
};

export const untagFunction = async (logger: OperationLogLine, functionArn: Arn, tagKeys: string[]) => {
  logger.update(`Untag function`);

  await getLambdaClient().send(
    new UntagResourceCommand({
      Resource: functionArn,
      TagKeys: tagKeys
    })
  );
};

const getSourceZipFile = (sourceFile: string, additionalFiles?: string[]) => {
  return getZipBuffer(sourceFile, `main.mjs`, additionalFiles);
};

const getSourceHandlerName = (handlerName: string) => {
  return `main.${handlerName}`;
};
