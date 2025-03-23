import type { Db } from '../aurora.js';

import { randomUUID } from 'node:crypto';

import { Order } from '@ez4/database';

type DbClient = Db['client'];

export type CreateItemInput = {
  name: string;
  description?: string;
  category?: {
    name: string;
    description?: string;
  };
};

export const createItem = async (client: DbClient, input: CreateItemInput) => {
  const now = new Date().toISOString();

  const { id: itemId, category } = await client.items.insertOne({
    select: {
      id: true,
      category: {
        id: true
      }
    },
    data: {
      id: randomUUID(),
      name: input.name,
      description: input.description,
      category: input.category,
      created_at: now,
      updated_at: now
    }
  });

  return {
    itemId,
    categoryId: category?.id
  };
};

export const readItem = async (client: DbClient, id: string) => {
  return client.items.findOne({
    select: {
      name: true,
      description: true,
      category: true
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
  const { id, name, description, category } = input;

  const now = new Date().toISOString();

  return client.items.updateOne({
    select: {
      name: true,
      description: true,
      category: true
    },
    data: {
      name,
      description,
      category,
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
      description: true
    },
    where: {
      id
    }
  });
};

export const listItems = async (client: DbClient, page: number, limit: number) => {
  const cursor = (page - 1) * limit;

  const { records: items, total } = await client.items.findMany({
    count: true,
    select: {
      id: true,
      name: true,
      category: {
        name: true
      }
    },
    order: {
      created_at: Order.Desc
    },
    cursor,
    limit
  });

  return {
    items,
    total
  };
};
