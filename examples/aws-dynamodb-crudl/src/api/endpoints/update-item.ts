import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ItemType } from '../../schemas/item';
import type { Api } from '../../api';

import { HttpNotFoundError } from '@ez4/gateway';

import { updateItem } from '../repository';

declare class UpdateItemRequest implements Http.Request {
  parameters: {
    /**
     * Item Id.
     */
    id: String.UUID;
  };

  body: {
    /**
     * New item name.
     */
    name?: String.Size<1, 16>;

    /**
     * New item description.
     */
    description?: String.Size<1, 128>;

    /**
     * New item type.
     */
    type?: ItemType;
  };
}

declare class UpdateItemResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * Old item name.
     */
    name: string;

    /**
     * Old item description.
     */
    description?: string;

    /**
     * Old item type.
     */
    type: ItemType;
  };
}

/**
 * Handle item update requests.
 */
export async function updateItemHandler(request: UpdateItemRequest, context: Service.Context<Api>): Promise<UpdateItemResponse> {
  const { name, description, type } = request.body;
  const { id } = request.parameters;
  const { dynamoDb } = context;

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
