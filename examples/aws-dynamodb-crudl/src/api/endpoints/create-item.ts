import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ItemType } from '../../schemas/item.js';
import type { Api } from '../../api.js';

import { createItem } from '../repository.js';

declare class CreateItemRequest implements Http.Request {
  body: {
    /**
     * Item name.
     */
    name: String.Size<1, 16>;

    /**
     * Item description.
     */
    description?: String.Size<1, 128>;

    /**
     * Item type.
     */
    type: ItemType;
  };
}

export declare class CreateItemResponse implements Http.Response {
  status: 201;

  body: {
    /**
     * Created item Id.
     */
    item_id: string;
  };
}

/**
 * Handle item create requests.
 */
export async function createItemHandler(request: CreateItemRequest, context: Service.Context<Api>): Promise<CreateItemResponse> {
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
