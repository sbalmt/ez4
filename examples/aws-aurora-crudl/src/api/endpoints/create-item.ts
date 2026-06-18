import type { Service } from '@ez4/common';
import type { Integer, String } from '@ez4/schema';
import type { Http } from '@ez4/gateway';
import type { NewItemCategory, SetItemCategory } from '../types/category';
import type { NewItemTag } from '../types/tags';
import type { Api } from '../../api';

import { createItem } from '../repository';

declare class CreateItemRequest implements Http.Request {
  body: {
    /**
     * @description Item name.
     */
    name: String.Size<1, 16>;

    /**
     * @description Item description.
     */
    description?: String.Size<1, 128>;

    /**
     * @description Item order.
     */
    order?: Integer.Any;

    /**
     * @description Item category.
     */
    category?: NewItemCategory | SetItemCategory;

    /**
     * @description New items tags.
     */
    tags?: NewItemTag[];
  };
}

declare class CreateItemResponse implements Http.Response {
  status: 201;

  body: {
    /**
     * @description Created item Id.
     */
    item_id: String.UUID;

    /**
     * @description Created category Id.
     */
    category_id?: String.UUID;
  };
}

/**
 * Handle item create requests.
 *
 * @description Create a new item corresponding to the given request.
 * @summary Create new items.
 */
export async function createItemHandler(
  request: Http.Incoming<CreateItemRequest>,
  context: Service.Context<Api>
): Promise<CreateItemResponse> {
  const { name, description, order, category, tags } = request.body;
  const { auroraDb } = context;

  const { itemId, categoryId } = await createItem(auroraDb, {
    name,
    description,
    order,
    category,
    tags
  });

  return {
    status: 201,
    body: {
      item_id: itemId,
      category_id: categoryId
    }
  };
}
