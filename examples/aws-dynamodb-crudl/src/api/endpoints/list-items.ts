import type { Integer } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ItemType } from '../../schemas/item.js';
import type { Api } from '../../api.js';

import { listItems } from '../repository.js';

export declare class ListItemsRequest implements Http.Request {
  query: {
    /**
     * Page cursor.
     */
    cursor?: string;

    /**
     * Page limit.
     */
    limit?: Integer.Range<1, 10>;

    /**
     * Item type filter.
     */
    type: ItemType;
  };
}

export declare class ListItemsResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * Page items.
     */
    items: {
      id: string;
      name: string;
      description?: string;
      type: ItemType;
    }[];

    /**
     * Next page.
     */
    next?: string;
  };
}

/**
 * Handle item list requests.
 */
export async function listItemsHandler(
  request: ListItemsRequest,
  context: Service.Context<Api>
): Promise<ListItemsResponse> {
  const { cursor, limit, type } = request.query;
  const { dynamoDb } = context;

  const result = await listItems(dynamoDb, {
    cursor,
    limit,
    type
  });

  const items = result.records.map(({ id, name, description, type }) => {
    return {
      id,
      name,
      description,
      type
    };
  });

  const next = result.cursor?.toString();

  return {
    status: 200,
    body: {
      items,
      next
    }
  };
}
