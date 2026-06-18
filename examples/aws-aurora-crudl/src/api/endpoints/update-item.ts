import type { String, Integer } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { NewItemCategory } from '../types/category';
import type { NewItemTag } from '../types/tags';
import type { Api } from '../../api';

import { HttpNotFoundError } from '@ez4/gateway';

import { updateItem } from '../repository';

declare class UpdateItemRequest implements Http.Request {
  parameters: {
    /**
     * @description Item Id.
     */
    id: String.UUID;
  };

  body: {
    /**
     * @description New item name.
     */
    name?: String.Size<1, 16>;

    /**
     * @description New item order.
     */
    order?: Integer.Any;

    /**
     * @description New item description.
     */
    description?: String.Size<1, 128>;

    /**
     * @description New item category.
     */
    category?: NewItemCategory;

    /**
     * @description New items tags.
     */
    tags?: NewItemTag[];
  };
}

declare class UpdateItemResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * @description Old item name.
     */
    name: string;

    /**
     * @description Old or current item description.
     */
    description?: string;

    /**
     * @description Old or current item order.
     */
    order?: Integer.Any;

    /**
     * @description Old or current item category name.
     */
    category_name?: string;

    /**
     * @description Old or current item category description.
     */
    category_description?: string;
  };
}

/**
 * Handle item update requests.
 *
 * @description Update an item corresponding to the given request.
 * @summary Update items.
 */
export async function updateItemHandler(
  request: Http.Incoming<UpdateItemRequest>,
  context: Service.Context<Api>
): Promise<UpdateItemResponse> {
  const { auroraDb } = context;
  const { name, description, order, category, tags } = request.body;
  const { id } = request.parameters;

  const oldItem = await updateItem(auroraDb, {
    id,
    name,
    description,
    order,
    category,
    tags
  });

  if (!oldItem) {
    throw new HttpNotFoundError(`Item not found.`);
  }

  return {
    status: 200,
    body: {
      name: oldItem.name,
      description: oldItem.description,
      order: oldItem.order,
      category_name: oldItem.category?.name,
      category_description: oldItem.category?.description
    }
  };
}
