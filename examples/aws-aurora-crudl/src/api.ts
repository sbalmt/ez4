import type { Http } from '@ez4/gateway';
import type { Environment } from '@ez4/common';
import type { createItemHandler } from './api/endpoints/create-item.js';
import type { updateItemHandler } from './api/endpoints/update-item.js';
import type { readItemHandler } from './api/endpoints/read-item.js';
import type { deleteItemHandler } from './api/endpoints/delete-item.js';
import type { listItemsHandler } from './api/endpoints/list-items.js';
import type { Db } from './aurora.js';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service {
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
