import type { CreateEventSourceMappingRequest, UpdateEventSourceMappingRequest } from '@aws-sdk/client-lambda';
import type { Arn, OperationLogLine } from '@ez4/aws-common';

import {
  CreateEventSourceMappingCommand,
  UpdateEventSourceMappingCommand,
  DeleteEventSourceMappingCommand,
  ListEventSourceMappingsCommand,
  FunctionResponseType,
  EventSourcePosition,
  ResourceNotFoundException
} from '@aws-sdk/client-lambda';

import { parseArn } from '@ez4/aws-common';

import { getLambdaClient } from '../utils/deploy';
import { waitForReadyState } from './helpers/state';
import { MappingService } from './types';

export type BatchOptions = {
  maxWait?: number;
  size: number;
};

export type CreateRequest = {
  functionName: string;
  sourceArn: Arn;
  concurrency?: number;
  enabled?: boolean;
  batch?: BatchOptions;
};

export type ImportOrCreateResponse = {
  eventId: string;
};

export type UpdateRequest = CreateRequest;

export const importMapping = async (
  logger: OperationLogLine,
  functionName: string,
  sourceArn: string
): Promise<ImportOrCreateResponse | undefined> => {
  logger.update(`Importing mapping`);

  const response = await getLambdaClient().send(
    new ListEventSourceMappingsCommand({
      FunctionName: functionName,
      EventSourceArn: sourceArn
    })
  );

  const [eventSource] = response.EventSourceMappings!;

  if (!eventSource) {
    return undefined;
  }

  const eventId = eventSource.UUID!;

  return {
    eventId
  };
};

export const createMapping = async (logger: OperationLogLine, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  logger.update(`Creating mapping`);

  const { sourceArn, functionName } = request;

  const client = getLambdaClient();

  const response = await client.send(
    new CreateEventSourceMappingCommand({
      FunctionName: functionName,
      EventSourceArn: sourceArn,
      ...upsertMappingRequest(request)
    })
  );

  const eventId = response.UUID!;

  await waitForReadyState(client, eventId);

  return {
    eventId
  };
};

export const updateMapping = async (logger: OperationLogLine, eventId: string, request: UpdateRequest) => {
  logger.update(`Updating mapping`);

  const { functionName } = request;

  const client = getLambdaClient();

  await client.send(
    new UpdateEventSourceMappingCommand({
      UUID: eventId,
      FunctionName: functionName,
      ...upsertMappingRequest(request)
    })
  );

  await waitForReadyState(client, eventId);
};

export const deleteMapping = async (logger: OperationLogLine, eventId: string) => {
  logger.update(`Deleting mapping`);

  try {
    await getLambdaClient().send(
      new DeleteEventSourceMappingCommand({
        UUID: eventId
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

const upsertMappingRequest = (
  request: CreateRequest | UpdateRequest
): Omit<Partial<CreateEventSourceMappingRequest | UpdateEventSourceMappingRequest>, 'functionName'> => {
  const { sourceArn, enabled, concurrency, batch } = request;

  const { service } = parseArn(sourceArn);

  return {
    Enabled: enabled,
    FunctionResponseTypes: [FunctionResponseType.ReportBatchItemFailures],
    MaximumBatchingWindowInSeconds: batch?.maxWait,
    BatchSize: batch?.size,
    ...(service === MappingService.DynamoDB && {
      StartingPosition: EventSourcePosition.LATEST
    }),
    ...(service === MappingService.Queue && {
      ScalingConfig: {
        MaximumConcurrency: concurrency
      }
    })
  };
};
