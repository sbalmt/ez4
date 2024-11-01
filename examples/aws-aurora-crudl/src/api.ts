import type { Http } from '@ez4/gateway';
import type { Environment } from '@ez4/common';
import type { ApiRequests } from './api/requests.js';
import type { Db } from './aurora.js';

import type {
  createItemHandler,
  deleteItemHandler,
  listItemsHandler,
  readItemHandler,
  updateItemHandler
} from './api/handlers.js';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service<ApiRequests> {
  /**
   * Display name for this API.
   */
  name: 'Aurora CRUDL API';

  /**
   * All API routes.
   */
  routes: [
    {
      path: 'POST /create-item';
      handler: typeof createItemHandler;
    },
    {
      path: 'GET /read-item/{id}';
      handler: typeof readItemHandler;
    },
    {
      path: 'PATCH /update-item/{id}';
      handler: typeof updateItemHandler;
    },
    {
      path: 'DELETE /delete-item/{id}';
      handler: typeof deleteItemHandler;
    },
    {
      path: 'GET /list-items';
      handler: typeof listItemsHandler;
    }
  ];

  services: {
    auroraDb: Environment.Service<Db>;
  };
}
