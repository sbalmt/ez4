import type { Arn } from '@ez4/aws-common';

import {
  CreateEventSourceMappingCommand,
  UpdateEventSourceMappingCommand,
  DeleteEventSourceMappingCommand,
  GetEventSourceMappingCommand,
  EventSourcePosition,
  LambdaClient
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
  batch?: BatchOptions;
  sourceArn: Arn;
  enabled?: boolean;
};

export type CreateResponse = {
  eventId: string;
};

export type UpdateRequest = Partial<Omit<CreateRequest, 'sourceArn'>>;

export const createMapping = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(MappingServiceName, request.functionName);

  const { service } = parseArn(request.sourceArn);
  const { batch } = request;

  const response = await client.send(
    new CreateEventSourceMappingCommand({
      FunctionName: request.functionName,
      EventSourceArn: request.sourceArn,
      Enabled: request.enabled,
      ...(service === 'dynamodb' && {
        StartingPosition: EventSourcePosition.LATEST
      }),
      ...(batch && {
        BatchSize: batch.batchSize,
        MaximumBatchingWindowInSeconds: batch.maxWindow
      })
    })
  );

  const eventId = response.UUID!;

  await waitForReadyState(eventId);

  return {
    eventId
  };
};

export const updateMapping = async (eventId: string, request: UpdateRequest) => {
  Logger.logUpdate(MappingServiceName, eventId);

  const { batch } = request;

  await client.send(
    new UpdateEventSourceMappingCommand({
      UUID: eventId,
      FunctionName: request.functionName,
      Enabled: request.enabled,
      ...(batch && {
        BatchSize: batch.batchSize,
        MaximumBatchingWindowInSeconds: batch.maxWindow
      })
    })
  );

  await waitForReadyState(eventId);
};

export const deleteMapping = async (eventId: string) => {
  Logger.logDelete(MappingServiceName, eventId);

  await client.send(
    new DeleteEventSourceMappingCommand({
      UUID: eventId
    })
  );
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
