import type {
  CreateItemRequest,
  DeleteItemRequest,
  ListItemsRequest,
  ReadItemRequest,
  UpdateItemRequest
} from './items/requests.js';

export type ApiRequests = [
  CreateItemRequest,
  ReadItemRequest,
  UpdateItemRequest,
  DeleteItemRequest,
  ListItemsRequest
];
