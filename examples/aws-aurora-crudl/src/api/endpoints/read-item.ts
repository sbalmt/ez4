import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
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
     * Item category name.
     */
    category_name?: string;

    /**
     * Item category description.
     */
    category_description?: string;
  };
}

/**
 * Handle item read requests.
 */
export async function readItemHandler(request: Http.Incoming<ReadItemRequest>, context: Service.Context<Api>): Promise<ReadItemResponse> {
  const { auroraDb } = context;
  const { id } = request.parameters;

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
      category_description: item.category?.description
    }
  };
}
