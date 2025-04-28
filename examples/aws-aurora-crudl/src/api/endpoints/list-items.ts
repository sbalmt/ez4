import type { Integer } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { Api } from '../../api.js';

import { listItems } from '../repository.js';

export declare class ListItemsRequest implements Http.Request {
  query: {
    /**
     * Page number.
     */
    page?: Integer.Min<1>;

    /**
     * Page limit.
     */
    limit?: Integer.Range<1, 10>;
  };
}

export declare class ListItemsResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * Total amount of items.
     */
    total: number;

    /**
     * Items of the current.
     */
    items: {
      id: string;
      name: string;
      category?: string;
    }[];
  };
}

/**
 * Handle item list requests.
 */
export async function listItemsHandler(
  request: Http.Incoming<ListItemsRequest>,
  context: Service.Context<Api>
): Promise<ListItemsResponse> {
  const { page = 1, limit = 10 } = request.query;
  const { auroraDb } = context;

  const { total, items: rawItems } = await listItems(auroraDb, page, limit);

  const items = rawItems.map(({ id, name, category }) => {
    return {
      id,
      name,
      category: category?.name
    };
  });

  return {
    status: 200,
    body: {
      total,
      items
    }
  };
}
