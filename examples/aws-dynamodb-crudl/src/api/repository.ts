import type { ItemType } from '../schemas/item';
import type { Db } from '../dynamo';

import { randomUUID } from 'node:crypto';

import { Order } from '@ez4/database';

type DbClient = Db['client'];

export type CreateItemInput = {
  name: string;
  description?: string;
  type: ItemType;
};

export const createItem = async (client: DbClient, input: CreateItemInput) => {
  const now = new Date().toISOString();

  const { name, description, type } = input;

  const { id } = await client.items.insertOne({
    select: {
      id: true
    },
    data: {
      id: randomUUID(),
      name,
      description,
      type,
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
      description: true,
      type: true
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
  const { id, name, description, type } = input;

  const now = new Date().toISOString();

  return client.items.updateOne({
    select: {
      name: true,
      description: true,
      type: true
    },
    data: {
      name,
      description,
      type,
      updated_at: now
    },
    where: {
      id
    }
  });
};

export const deleteItem = async (client: DbClient, id: string) => {
  return client.items.deleteOne({
    select: {
      name: true,
      description: true,
      type: true
    },
    where: {
      id
    }
  });
};

export type ListItemsInput = {
  cursor?: string;
  limit?: number;
  type: ItemType;
};

export const listItems = async (client: DbClient, input: ListItemsInput) => {
  const { cursor, limit = 5, type } = input;

  const {
    records: items,
    cursor: next,
    total
  } = await client.items.findMany({
    count: true,
    select: {
      id: true,
      name: true,
      description: true,
      type: true
    },
    where: {
      type
    },
    order: {
      created_at: Order.Desc
    },
    limit,
    cursor
  });

  return {
    next: next?.toString(),
    items,
    total
  };
};
