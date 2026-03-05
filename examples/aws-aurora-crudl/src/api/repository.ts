import type { Db } from '../aurora';

import { randomUUID } from 'node:crypto';

import { Order } from '@ez4/database';

type DbClient = Db['client'];

export type CreateItemInput = {
  name: string;
  description?: string;
  category?:
    | {
        name: string;
        description?: string;
      }
    | {
        category_id: string;
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
      ...(input.category && {
        category:
          'category_id' in input.category
            ? {
                id: input.category.category_id
              }
            : {
                id: randomUUID(),
                ...input.category
              }
      }),
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
      ...(category && {
        category:
          'category_id' in category
            ? {
                id: category.category_id
              }
            : {
                id: randomUUID(),
                ...input.category
              }
      }),
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
    skip: (page - 1) * limit,
    take: limit
  });

  return {
    items,
    total
  };
};
