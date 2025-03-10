import type { CreateEventSourceMappingRequest, UpdateEventSourceMappingRequest } from '@aws-sdk/client-lambda';
import type { Arn } from '@ez4/aws-common';

import {
  LambdaClient,
  GetEventSourceMappingCommand,
  CreateEventSourceMappingCommand,
  UpdateEventSourceMappingCommand,
  DeleteEventSourceMappingCommand,
  ListEventSourceMappingsCommand,
  EventSourcePosition,
  ResourceNotFoundException
} from '@aws-sdk/client-lambda';

import { Logger, parseArn } from '@ez4/aws-common';
import { waitFor } from '@ez4/utils';

import { MappingServiceName } from './types.js';

const client = new LambdaClient({});

export type BatchOptions = {
  batchSize: number;
  maxWindow: number;
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

export const importMapping = async (functionName: string, sourceArn: string): Promise<ImportOrCreateResponse | undefined> => {
  Logger.logImport(MappingServiceName, functionName);

  const response = await client.send(
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

export const createMapping = async (request: CreateRequest): Promise<ImportOrCreateResponse> => {
  const { sourceArn, functionName } = request;

  Logger.logCreate(MappingServiceName, functionName);

  const response = await client.send(
    new CreateEventSourceMappingCommand({
      FunctionName: functionName,
      EventSourceArn: sourceArn,
      ...upsertMappingRequest(request)
    })
  );

  const eventId = response.UUID!;

  await waitForReadyState(eventId);

  return {
    eventId
  };
};

export const updateMapping = async (eventId: string, request: UpdateRequest) => {
  const { functionName } = request;

  Logger.logUpdate(MappingServiceName, `${functionName} (${eventId})`);

  await client.send(
    new UpdateEventSourceMappingCommand({
      UUID: eventId,
      FunctionName: functionName,
      ...upsertMappingRequest(request)
    })
  );

  await waitForReadyState(eventId);
};

export const deleteMapping = async (eventId: string) => {
  Logger.logDelete(MappingServiceName, eventId);

  try {
    await client.send(
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

const getMappingState = async (eventId: string) => {
  const response = await client.send(
    new GetEventSourceMappingCommand({
      UUID: eventId
    })
  );

  return response.State!;
};

const waitForReadyState = async (eventId: string) => {
  const readyState = new Set(['Enabled', 'Disabled']);

  await waitFor(async () => {
    const state = await getMappingState(eventId);

    return readyState.has(state);
  });
};

const upsertMappingRequest = (
  request: CreateRequest | UpdateRequest
): Omit<Partial<CreateEventSourceMappingRequest | UpdateEventSourceMappingRequest>, 'functionName'> => {
  const { sourceArn, enabled, concurrency, batch } = request;

  const { service } = parseArn(sourceArn);

  return {
    Enabled: enabled,
    ...(service === 'dynamodb' && {
      StartingPosition: EventSourcePosition.LATEST
    }),
    ...(service === 'sqs' &&
      concurrency && {
        ScalingConfig: {
          MaximumConcurrency: concurrency
        }
      }),
    ...(batch && {
      MaximumBatchingWindowInSeconds: batch.maxWindow,
      BatchSize: batch.batchSize
    })
  };
};
