import type { Http } from '@ez4/gateway';
import type { ItemType } from '../../dynamo/items.js';

export declare class CreateItemResponse implements Http.Response {
  status: 201;

  body: {
    /**
     * Created item Id.
     */
    item_id: string;
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
     * Item type.
     */
    type: ItemType;
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
     * Old item description.
     */
    description?: string;

    /**
     * Old item type.
     */
    type: ItemType;
  };
}

export declare class DeleteItemResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * Old item name.
     */
    name: string;

    /**
     * Old item description.
     */
    description?: string;

    /**
     * Old item type.
     */
    type: ItemType;
  };
}

type ListItem = {
  id: string;
  name: string;
  description?: string;
  type: ItemType;
};

export declare class ListItemsResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * Page items.
     */
    items: ListItem[];

    /**
     * Next page.
     */
    next?: string;
  };
}
