import {
  CreateEventSourceMappingCommand,
  DeleteEventSourceMappingCommand,
  GetEventSourceMappingCommand,
  LambdaClient,
  UpdateEventSourceMappingCommand
} from '@aws-sdk/client-lambda';

import { waitFor } from '@ez4/utils';
import { Logger } from '@ez4/aws-common';

import { MappingServiceName } from './types.js';

const client = new LambdaClient({});

export type RequestForBatch = {
  batchSize: number;
  maxBatchWindow: number;
};

export type CreateRequestBase = {
  functionName: string;
  queueArn: string;
  enabled?: boolean;
};

export type CreateRequest = CreateRequestBase | (CreateRequestBase & RequestForBatch);

export type CreateResponse = {
  eventId: string;
};

export type UpdateRequestBase = Partial<Omit<CreateRequestBase, 'queueArn'>>;

export type UpdateRequest = UpdateRequestBase | (UpdateRequestBase & RequestForBatch);

export const createMapping = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(MappingServiceName, request.functionName);

  const response = await client.send(
    new CreateEventSourceMappingCommand({
      FunctionName: request.functionName,
      EventSourceArn: request.queueArn,
      Enabled: request.enabled,
      ...('batchSize' in request && {
        BatchSize: request.batchSize,
        MaximumBatchingWindowInSeconds: request.maxBatchWindow
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

  await client.send(
    new UpdateEventSourceMappingCommand({
      UUID: eventId,
      FunctionName: request.functionName,
      Enabled: request.enabled,
      ...('batchSize' in request && {
        BatchSize: request.batchSize,
        MaximumBatchingWindowInSeconds: request.maxBatchWindow
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
