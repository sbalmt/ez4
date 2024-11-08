import type { Database, Query } from '@ez4/database';

import { Order } from '@ez4/database';

type PrepareResult = string;

export const prepareOrderFields = <T extends Database.Schema, I extends Database.Indexes<T>>(
  order: Query.OrderInput<I>
): PrepareResult => {
  const operations = [];

  for (const fieldKey in order) {
    const fieldOrder = order[fieldKey as keyof Query.OrderInput<I>];

    if (fieldOrder) {
      const queryOrder = getFieldOrder(fieldOrder);

      operations.push(`"${fieldKey}" ${queryOrder}`);
    }
  }

  return operations.join(',');
};

const getFieldOrder = (order: Order) => {
  switch (order) {
    case Order.Asc:
      return 'ASC';

    case Order.Desc:
      return 'DESC';

    default:
      throw new Error(`Order ${order} isn't supported.`);
  }
};
