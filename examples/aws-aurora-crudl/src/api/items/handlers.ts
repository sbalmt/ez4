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

import { HttpBadRequestError } from '@ez4/gateway';

import { createItem, readItem, updateItem, deleteItem, listItems } from './repository.js';

/**
 * Handle item create requests.
 */
export async function createItemHandler(
  request: CreateItemRequest,
  context: Service.Context<Api>
): Promise<CreateItemResponse> {
  const { auroraDb } = context;
  const { name, description } = request.body;

  const itemId = await createItem(auroraDb, {
    name,
    description
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
  const { auroraDb } = context;
  const { id } = request.parameters;

  const item = await readItem(auroraDb, id);

  if (!item) {
    throw new HttpBadRequestError(`Item isn't found.`);
  }

  return {
    status: 200,

    body: {
      name: item.name,
      description: item.description,
      category_name: item.category?.name
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
  const { auroraDb } = context;
  const { name, description } = request.body;
  const { id } = request.parameters;

  const oldItem = await updateItem(auroraDb, {
    id,
    name,
    description
  });

  if (!oldItem) {
    throw new HttpBadRequestError(`Item isn't found.`);
  }

  return {
    status: 200,

    body: {
      name: oldItem.name,
      description: oldItem.description
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
  const { auroraDb } = context;
  const { id } = request.parameters;

  const item = await deleteItem(auroraDb, id);

  if (!item) {
    throw new HttpBadRequestError(`Item isn't found.`);
  }

  return {
    status: 200,

    body: {
      name: item.name,
      description: item.description
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
  const { cursor, limit } = request.query;
  const { auroraDb } = context;

  const result = await listItems(auroraDb, {
    cursor,
    limit
  });

  const items = result.records.map(({ id, name, description }) => {
    return {
      id,
      name,
      description
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
