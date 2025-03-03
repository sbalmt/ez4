import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { Api } from '../../api.js';

import { HttpNotFoundError } from '@ez4/gateway';

import { updateItem } from '../repository.js';

export declare class UpdateItemRequest implements Http.Request {
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
     * Item category.
     */
    category?: {
      /**
       * New category name.
       */
      name: String.Size<1, 32>;

      /**
       * New category description.
       */
      description?: String.Size<1, 128>;
    };
  };
}

export declare class UpdateItemResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * Old item name.
     */
    name: string;

    /**
     * Old or current item description.
     */
    description?: string;

    /**
     * Old or current item category name.
     */
    category_name?: string;

    /**
     * Old or current item category description.
     */
    category_description?: string;
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
  const { name, description, category } = request.body;
  const { id } = request.parameters;

  const oldItem = await updateItem(auroraDb, {
    id,
    name,
    description,
    category
  });

  if (!oldItem) {
    throw new HttpNotFoundError(`Item not found.`);
  }

  return {
    status: 200,
    body: {
      name: oldItem.name,
      description: oldItem.description,
      category_name: oldItem.category?.name,
      category_description: oldItem.category?.description
    }
  };
}
