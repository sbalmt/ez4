import type { FileStatus } from '../schemas/file.js';
import type { FileDb } from '../dynamo.js';

import { randomUUID } from 'node:crypto';

type DbClient = FileDb['client'];

export type CreateFileInput = {
  status: FileStatus;
};

export const createFile = async (client: DbClient, input: CreateFileInput) => {
  const id = randomUUID();

  const now = new Date().toISOString();

  await client.files.insertOne({
    data: {
      id,
      status: input.status,
      created_at: now,
      updated_at: now
    }
  });

  return id;
};

export type UpdateItemInput = Partial<CreateFileInput> & {
  id: string;
};

export const updateFile = async (client: DbClient, input: UpdateItemInput) => {
  const now = new Date().toISOString();

  await client.files.updateOne({
    select: {
      id: true
    },
    data: {
      status: input.status,
      updated_at: now
    },
    where: {
      id: input.id
    }
  });
};

export const deleteFile = async (client: DbClient, id: string) => {
  await client.files.deleteOne({
    select: {
      id: true
    },
    where: {
      id
    }
  });
};

export type ListFilesInput = {
  cursor?: string;
  limit?: number;
};

export const listFiles = async (client: DbClient, input: ListFilesInput) => {
  const { cursor, limit = 5 } = input;

  return client.files.findMany({
    select: {
      id: true,
      status: true,
      created_at: true,
      updated_at: true
    },
    limit,
    cursor
  });
};
