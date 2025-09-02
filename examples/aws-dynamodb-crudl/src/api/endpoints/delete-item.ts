import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ItemType } from '../../schemas/item';
import type { Api } from '../../api';

import { HttpNotFoundError } from '@ez4/gateway';

import { deleteItem } from '../repository';

declare class DeleteItemRequest implements Http.Request {
  parameters: {
    /**
     * Item Id.
     */
    id: String.UUID;
  };
}

declare class DeleteItemResponse implements Http.Response {
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
 * Handle item delete requests.
 */
export async function deleteItemHandler(request: DeleteItemRequest, context: Service.Context<Api>): Promise<DeleteItemResponse> {
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
