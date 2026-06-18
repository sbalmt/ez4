import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ItemTagType } from '../../schemas/item';
import type { Api } from '../../api';

import { HttpNotFoundError } from '@ez4/gateway';

import { readItem } from '../repository';

declare class ReadItemRequest implements Http.Request {
  parameters: {
    /**
     * @description Item Id.
     */
    id: String.UUID;
  };
}

declare class ReadItemResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * @description Item name.
     */
    name: string;

    /**
     * @description Item description.
     */
    description?: string;

    /**
     * @description Item category name.
     */
    category_name?: string;

    /**
     * @description Item category description.
     */
    category_description?: string;

    /**
     * @description Item order.
     */
    order?: number;

    /**
     * @description Item tags.
     */
    tags?: {
      /**
       * @description Item tag label.
       */
      label: string;

      /**
       * @descriptionItem tag type.
       */
      type: ItemTagType;
    }[];
  };
}

/**
 * Handle item read requests.
 *
 * @description Read the details of an item corresponding to the given `id`.
 * @summary Read item details.
 */
export async function readItemHandler(request: Http.Incoming<ReadItemRequest>, context: Service.Context<Api>): Promise<ReadItemResponse> {
  const { id } = request.parameters;
  const { auroraDb } = context;

  const item = await readItem(auroraDb, id);

  if (!item) {
    throw new HttpNotFoundError(`Item not found.`);
  }

  return {
    status: 200,
    body: {
      name: item.name,
      description: item.description,
      category_name: item.category?.name,
      category_description: item.category?.description,
      order: item.order,
      tags: item.tags
    }
  };
}
