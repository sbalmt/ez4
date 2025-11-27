import type { Http } from '@ez4/gateway';

import type { createItemHandler } from './endpoints/create-item';
import type { readItemHandler } from './endpoints/read-item';
import type { updateItemHandler } from './endpoints/update-item';
import type { deleteItemHandler } from './endpoints/delete-item';
import type { listItemsHandler } from './endpoints/list-items';

export type AllRoutes = [
  Http.UseRoute<{
    path: 'POST /create-item';
    handler: typeof createItemHandler;
  }>,
  Http.UseRoute<{
    path: 'GET /read-item/{id}';
    handler: typeof readItemHandler;
  }>,
  Http.UseRoute<{
    path: 'PATCH /update-item/{id}';
    handler: typeof updateItemHandler;
  }>,
  Http.UseRoute<{
    path: 'DELETE /delete-item/{id}';
    handler: typeof deleteItemHandler;
  }>,
  Http.UseRoute<{
    path: 'GET /list-items';
    handler: typeof listItemsHandler;
  }>
];
