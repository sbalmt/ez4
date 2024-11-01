import type { Db } from '../../dynamo.js';

import { randomUUID } from 'crypto';

type DbClient = Db['client'];

export type CreateItemInput = {
  name: string;
  description?: string;
};

export const createItem = async (client: DbClient, input: CreateItemInput) => {
  const id = randomUUID();

  const now = new Date().toISOString();

  const { name, description } = input;

  await client.items.insertOne({
    data: {
      id,
      name,
      description,
      created_at: now,
      updated_at: now
    }
  });

  return id;
};

export const readItem = async (client: DbClient, id: string) => {
  return client.items.findOne({
    select: {
      name: true,
      description: true
    },
    where: {
      id
    }
  });
};

export type UpdateItemInput = Partial<CreateItemInput> & {
  id: string;
};

export const updateItem = async (client: DbClient, input: UpdateItemInput) => {
  const { id, name, description } = input;

  const now = new Date().toISOString();

  try {
    return await client.items.updateOne({
      select: {
        name: true,
        description: true
      },
      data: {
        name,
        description,
        updated_at: now
      },
      where: {
        id
      }
    });
  } catch (e) {
    // Conditional check failure if the item don't exists.
    return undefined;
  }
};

export const deleteItem = async (client: DbClient, id: string) => {
  return client.items.deleteOne({
    select: {
      name: true,
      description: true
    },
    where: {
      id
    }
  });
};

export type ListItemsInput = {
  cursor?: string;
  limit?: number;
};

export const listItems = async (client: DbClient, input: ListItemsInput) => {
  const { cursor, limit = 5 } = input;

  return client.items.findMany({
    select: {
      id: true,
      name: true,
      description: true
    },
    limit,
    cursor
  });
};
