import type { Service } from '@ez4/common';
import type { Api } from '../../api.js';

import type {
  CreateItemRequest,
  DeleteItemRequest,
  ListItemsRequest,
  ReadItemRequest,
  UpdateItemRequest
} from './requests.js';

import type {
  CreateItemResponse,
  DeleteItemResponse,
  ListItemsResponse,
  ReadItemResponse,
  UpdateItemResponse
} from './responses.js';

import { HttpNotFoundError } from '@ez4/gateway';

import { createItem, readItem, updateItem, deleteItem, listItems } from './repository.js';

/**
 * Handle item create requests.
 */
export async function createItemHandler(
  request: CreateItemRequest,
  context: Service.Context<Api>
): Promise<CreateItemResponse> {
  const { name, description, type } = request.body;
  const { dynamoDb } = context;

  const itemId = await createItem(dynamoDb, {
    name,
    description,
    type
  });

  return {
    status: 201,

    body: {
      item_id: itemId
    }
  };
}

/**
 * Handle item read requests.
 */
export async function readItemHandler(
  request: ReadItemRequest,
  context: Service.Context<Api>
): Promise<ReadItemResponse> {
  const { dynamoDb } = context;
  const { id } = request.parameters;

  const item = await readItem(dynamoDb, id);

  if (!item) {
    throw new HttpNotFoundError(`Item not found.`);
  }

  return {
    status: 200,

    body: {
      name: item.name,
      description: item.description,
      type: item.type
    }
  };
}

/**
 * Handle item update requests.
 */
export async function updateItemHandler(
  request: UpdateItemRequest,
  context: Service.Context<Api>
): Promise<UpdateItemResponse> {
  const { dynamoDb } = context;
  const { name, description, type } = request.body;
  const { id } = request.parameters;

  const oldItem = await updateItem(dynamoDb, {
    id,
    name,
    description,
    type
  });

  if (!oldItem) {
    throw new HttpNotFoundError(`Item not found.`);
  }

  return {
    status: 200,

    body: {
      name: oldItem.name,
      description: oldItem.description,
      type: oldItem.type
    }
  };
}

/**
 * Handle item delete requests.
 */
export async function deleteItemHandler(
  request: DeleteItemRequest,
  context: Service.Context<Api>
): Promise<DeleteItemResponse> {
  const { dynamoDb } = context;
  const { id } = request.parameters;

  const item = await deleteItem(dynamoDb, id);

  if (!item) {
    throw new HttpNotFoundError(`Item not found.`);
  }

  return {
    status: 200,

    body: {
      name: item.name,
      description: item.description,
      type: item.type
    }
  };
}

/**
 * Handle item list requests.
 */
export async function listItemsHandler(
  request: ListItemsRequest,
  context: Service.Context<Api>
): Promise<ListItemsResponse> {
  const { cursor, limit, type } = request.query;
  const { dynamoDb } = context;

  const result = await listItems(dynamoDb, {
    cursor,
    limit,
    type
  });

  const items = result.records.map(({ id, name, description, type }) => {
    return {
      id,
      name,
      description,
      type
    };
  });

  const next = result.cursor?.toString();

  return {
    status: 200,

    body: {
      items,
      next
    }
  };
}
