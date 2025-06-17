import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ItemType } from '../../schemas/item.js';
import type { Api } from '../../api.js';

import { HttpNotFoundError } from '@ez4/gateway';

import { readItem } from '../repository.js';

declare class ReadItemRequest implements Http.Request {
  parameters: {
    /**
     * Item Id.
     */
    id: String.UUID;
  };
}

export declare class ReadItemResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * Item name.
     */
    name: string;

    /**
     * Item description.
     */
    description?: string;

    /**
     * Item type.
     */
    type: ItemType;
  };
}

/**
 * Handle read item requests.
 */
export async function readItemHandler(request: ReadItemRequest, context: Service.Context<Api>): Promise<ReadItemResponse> {
  const { id } = request.parameters;
  const { dynamoDb } = context;

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
