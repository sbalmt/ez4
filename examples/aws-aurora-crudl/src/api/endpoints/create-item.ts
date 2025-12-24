import type { Service } from '@ez4/common';
import type { String } from '@ez4/schema';
import type { Http } from '@ez4/gateway';
import type { NewItemCategory, SetItemCategory } from '../types/category';
import type { Api } from '../../api';

import { createItem } from '../repository';

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
     * Item category.
     */
    category?: NewItemCategory | SetItemCategory;
  };
}

declare class CreateItemResponse implements Http.Response {
  status: 201;

  body: {
    /**
     * Created item Id.
     */
    item_id: string;

    /**
     * Created category Id.
     */
    category_id?: string;
  };
}

/**
 * Handle item create requests.
 */
export async function createItemHandler(
  request: Http.Incoming<CreateItemRequest>,
  context: Service.Context<Api>
): Promise<CreateItemResponse> {
  const { auroraDb } = context;
  const { name, description, category } = request.body;

  const { itemId, categoryId } = await createItem(auroraDb, {
    name,
    description,
    category
  });

  return {
    status: 201,
    body: {
      item_id: itemId,
      category_id: categoryId
    }
  };
}
