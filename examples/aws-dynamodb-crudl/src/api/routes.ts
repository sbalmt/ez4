import type { createItemHandler } from './endpoints/create-item';
import type { readItemHandler } from './endpoints/read-item';
import type { updateItemHandler } from './endpoints/update-item';
import type { deleteItemHandler } from './endpoints/delete-item';
import type { listItemsHandler } from './endpoints/list-items';

export type AllRoutes = [
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
