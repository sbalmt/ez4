import type { Integer } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { Api } from '../../api';

import { listItems } from '../repository';
import { ItemTagType } from '../../schemas/item';

declare class ListItemsRequest implements Http.Request {
  query: {
    /**
     * @description Page number.
     */
    page?: Integer.Min<1>;

    /**
     * @description Page limit.
     */
    limit?: Integer.Range<1, 10>;
  };
}

declare class ListItemsResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * @description Total amount of items.
     */
    total: number;

    /**
     * @description Items of the current page.
     */
    items: {
      /**
       * @description Item id.
       */
      id: string;

      /**
       * @description Item name.
       */
      name: string;

      /**
       * @description Item category name.
       */
      category?: string;

      /**
       * @description All visible tags for the item.
       */
      tags?: string[];
    }[];
  };
}

/**
 * Handle item list requests.
 *
 * @description List all items corresponding to the given page and limit.
 * @summary List items.
 */
export async function listItemsHandler(
  request: Http.Incoming<ListItemsRequest>,
  context: Service.Context<Api>
): Promise<ListItemsResponse> {
  const { page = 1, limit = 10 } = request.query;
  const { auroraDb } = context;

  const { total, items: rawItems } = await listItems(auroraDb, page, limit);

  const items = rawItems.map(({ id, name, category, tags }) => {
    const regularTags = tags?.filter(({ type }) => type === ItemTagType.Regular);

    return {
      id,
      name,
      category: category?.name,
      tags: regularTags?.map(({ label }) => label)
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
