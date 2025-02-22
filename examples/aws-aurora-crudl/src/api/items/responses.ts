import type { Http } from '@ez4/gateway';

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
     * Item category name.
     */
    category_name?: string;

    /**
     * Item category description.
     */
    category_description?: string;
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
     * Old or current item description.
     */
    description?: string;

    /**
     * Old or current item category name.
     */
    category_name?: string;

    /**
     * Old or current item category description.
     */
    category_description?: string;
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
  };
}

type ListItem = {
  id: string;
  name: string;
  category?: string;
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
