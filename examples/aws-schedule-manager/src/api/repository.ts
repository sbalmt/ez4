import type { EventStatus } from '../schemas/event';
import type { EventDb } from '../dynamo';

import { randomUUID } from 'node:crypto';

type DbClient = EventDb['client'];

export type CreateEventInput = {
  status: EventStatus;
  date: string;
};

export const createEvent = async (client: DbClient, input: CreateEventInput) => {
  const id = randomUUID();

  const now = new Date().toISOString();

  await client.events.insertOne({
    data: {
      id,
      date: input.date,
      status: input.status,
      created_at: now,
      updated_at: now
    }
  });

  return id;
};

export type UpdateItemInput = Partial<CreateEventInput> & {
  id: string;
};

export const updateEvent = async (client: DbClient, input: UpdateItemInput) => {
  const now = new Date().toISOString();

  await client.events.updateOne({
    select: {
      id: true
    },
    data: {
      date: input.date,
      status: input.status,
      updated_at: now
    },
    where: {
      id: input.id
    }
  });
};

export const deleteEvent = async (client: DbClient, id: string) => {
  await client.events.deleteOne({
    select: {
      id: true
    },
    where: {
      id
    }
  });
};

export type ListEventsInput = {
  cursor?: string;
  limit?: number;
};

export const listEvents = async (client: DbClient, input: ListEventsInput) => {
  const { cursor, limit = 5 } = input;

  return client.events.findMany({
    select: {
      id: true,
      date: true,
      status: true,
      created_at: true,
      updated_at: true
    },
    limit,
    cursor
  });
};
