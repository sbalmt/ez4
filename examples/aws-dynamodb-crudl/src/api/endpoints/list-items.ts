import type { Integer } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ItemType } from '../../schemas/item';
import type { Api } from '../../api';

import { listItems } from '../repository';

declare class ListItemsRequest implements Http.Request {
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

declare class ListItemsResponse implements Http.Response {
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
     * Total amount of items.
     */
    total: number;

    /**
     * Next page.
     */
    next?: string;
  };
}

/**
 * Handle item list requests.
 */
export async function listItemsHandler(request: ListItemsRequest, context: Service.Context<Api>): Promise<ListItemsResponse> {
  const { cursor, limit, type } = request.query;
  const { dynamoDb } = context;

  const { items, total, next } = await listItems(dynamoDb, {
    cursor,
    limit,
    type
  });

  return {
    status: 200,
    body: {
      items,
      total,
      next
    }
  };
}
