import type { Query } from '@ez4/database';

import { Order } from '@ez4/database';

type PrepareResult = string;

export const prepareOrderFields = (order: Query.OrderInput): PrepareResult => {
  const operations = [];

  for (const fieldKey in order) {
    const fieldOrder = order[fieldKey as keyof Query.OrderInput];

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
