import type { Integer, String } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

export declare class CreateItemRequest implements Http.Request {
  body: {
    /**
     * Item name.
     */
    name: String.Size<1, 16>;

    /**
     * Item description.
     */
    description?: String.Size<1, 128>;
  };
}

export declare class ReadItemRequest implements Http.Request {
  parameters: {
    /**
     * Item Id.
     */
    id: String.UUID;
  };
}

export declare class UpdateItemRequest implements Http.Request {
  parameters: {
    /**
     * Item Id.
     */
    id: String.UUID;
  };

  body: {
    /**
     * New item name.
     */
    name?: String.Size<1, 16>;

    /**
     * New item description.
     */
    description?: String.Size<1, 128>;
  };
}

export declare class DeleteItemRequest implements Http.Request {
  parameters: {
    /**
     * Item Id.
     */
    id: String.UUID;
  };
}

export declare class ListItemsRequest implements Http.Request {
  query: {
    /**
     * Page cursor.
     */
    cursor?: Integer.Min<1>;

    /**
     * Page limit.
     */
    limit?: Integer.Range<1, 10>;
  };
}
